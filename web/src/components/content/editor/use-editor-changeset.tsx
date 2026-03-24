import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { useCallback, useMemo, useRef } from "react";
import { useEventListener } from "../../../hooks/use-event-listener";
import { SelectionRange } from "../../../utils/selection-range";
import { EditorChangeset } from "./editor-changeset";
import { applyActions, EditorAction, EditorActionCmd } from "./editor-history";
import { AnyBlock, ContentEditor } from "./types";

/**
 * Manages a pending batch of editor actions. Actions accumulate via `push` and are
 * committed to history via `flush`.
 */
export function useEditorChangeset<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
): EditorChangeset<TBlock> {
  const changesetRef = useRef({
    actions: [] as EditorActionCmd<TBlock>[],
    batchId: Math.random(),
  });

  const extract = useCallback(() => {
    const { actions } = changesetRef.current;
    if (!NonEmpty.isNonEmpty(actions)) return null;
    return { type: "apply", actions } as const;
  }, []);

  const discard = useCallback(() => {
    changesetRef.current = {
      actions: [],
      batchId: Math.random(),
    };
  }, []);

  const flush = useCallback(
    (data?: unknown) => {
      const action = extract();
      const { batchId } = changesetRef.current;

      if (!action) return false;

      discard();

      const id = EditorAction.id(action, 1);
      const blockEl = editor.ref(id);
      const selection = blockEl && SelectionRange.read(blockEl);
      const selectionAfter = EditorAction.selectionAfter(action);
      editor.flush(new useEditorChangeset.FlushData(batchId, data));

      editor.push(action, data);

      if (
        selection &&
        (selection.start !== selectionAfter?.start ||
          selection.end !== selectionAfter?.end)
      ) {
        editor.push(
          {
            type: "focus",
            block: { id },
            selectionBefore: selectionAfter ?? selection,
            selectionAfter: selection,
          },
          data,
        );
      }

      return true;
    },
    [editor, extract, discard],
  );

  const push = useCallback(
    (action: EditorActionCmd<TBlock>) => {
      const id = EditorAction.id(action, 1);

      if (!id) return;

      const pendingAction = extract();

      action.selectionBefore ??=
        EditorAction.selectionBefore(action) ??
        (pendingAction && EditorAction.selectionAfter(pendingAction)) ??
        (editor.history.action
          ? EditorAction.selectionAfter(editor.history.action)
          : undefined);

      changesetRef.current.actions.push(action);
    },
    [extract, flush],
  );

  const peek = useCallback(
    (id: TBlock["id"]): TBlock | null => {
      const action = extract();
      const currentId = action && EditorAction.id(action, 1);

      if (!currentId || currentId === id) {
        return (
          applyActions(editor.blocks, ...changesetRef.current.actions).find(
            (b) => b.id === id,
          ) ?? null
        );
      }

      flush();
      return editor.peek(id);
    },
    [editor, extract, flush],
  );

  useEventListener(editor.bus, "flush", (event) => {
    if (
      !(
        event.detail.data instanceof useEditorChangeset.FlushData &&
        event.detail.data.batchId === changesetRef.current.batchId
      )
    ) {
      flush();
    }
  });

  return useMemo(
    () => ({
      extract,
      discard,
      flush,
      push,
      peek,

      get selectionBefore() {
        const action = extract();

        if (!action) return null;
        return EditorAction.selectionBefore(action) ?? null;
      },

      get selectionAfter() {
        const action = extract();

        if (!action) return null;
        return EditorAction.selectionAfter(action) ?? null;
      },
    }),
    [editor, extract, discard, flush, push, peek],
  );
}

useEditorChangeset.FlushData = class EditorChangesetFlush {
  constructor(
    public batchId: number,
    public data?: unknown,
  ) {}
};

export function useDebouncedEditorChangeset<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
  debounceMs: number | false,
) {
  const changeset = useEditorChangeset(editor);
  const timerRef = useRef<number>(null);

  const schedule = useCallback(() => {
    if (debounceMs === false) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => changeset.flush(), debounceMs);
  }, [changeset]);

  return useMemo(
    () => ({
      ...changeset,

      push(action: EditorActionCmd<TBlock>) {
        schedule();

        return changeset.push(action);
      },

      get selectionBefore() {
        return changeset.selectionBefore;
      },

      get selectionAfter() {
        return changeset.selectionAfter;
      },
    }),
    [changeset],
  );
}

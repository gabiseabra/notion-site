import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { useMemo, useRef } from "react";
import { useEventListener } from "../../../hooks/use-event-listener";
import { EditorChangeset } from "./editor-changeset";
import { EditorAction, EditorActionCmd } from "./editor-history";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor } from "./types";

/**
 * Manages a pending batch of editor actions.
 * Actions are accumulated in memory and pushed on flush.
 */
export function useEditorChangeset<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
  /**
   * Called on every push with the flat cmds of that push (not the accumulated batch);
   * The return value is what actually gets appended.
   * Use it to rewrite or cascade cmds, or as a per-push side-effect hook.
   */
  transform: (
    actions: EditorActionCmd<TBlock>[],
  ) => EditorActionCmd<TBlock>[] = (as) => as,
) {
  const changesetRef = useRef({
    actions: [] as EditorActionCmd<TBlock>[],
    batchId: Math.random(),
    targetBefore: EditorTarget.empty<TBlock>(),
    targetAfter: EditorTarget.empty<TBlock>(),
  });

  const changeset = useMemo<EditorChangeset<TBlock>>(
    () => ({
      get latest() {
        const { actions, targetBefore, targetAfter } = changesetRef.current;
        if (!NonEmpty.isNonEmpty(actions)) return null;
        return {
          type: "apply",
          actions,
          targetBefore,
          targetAfter,
        } as const;
      },

      get hasUnsavedChanges() {
        return changesetRef.current.actions.length > 0;
      },

      discard() {
        changesetRef.current.actions = [];
        changesetRef.current.batchId = Math.random();
      },

      push({ targetAfter, targetBefore, data, ...action }) {
        if (
          targetBefore &&
          EditorTarget.isEmpty(changesetRef.current.targetBefore)
        ) {
          changesetRef.current.targetBefore = targetBefore;
        }

        changesetRef.current.targetAfter =
          targetAfter ?? changesetRef.current.targetAfter;

        changesetRef.current.actions.push(
          ...transform(EditorAction.flat([action])),
        );
      },

      peek(id) {
        const { batchId, actions } = changesetRef.current;

        editor.peek(id, new useEditorChangeset.FlushData(batchId));

        return (
          EditorAction.applyCmd(actions, editor.history.getState()).find(
            (b) => b.id === id,
          ) ?? null
        );
      },
    }),
    [editor],
  );

  function flush(data?: unknown) {
    const { batchId } = changesetRef.current;
    const action = changeset.latest;

    if (!action) return;

    changeset.discard();

    editor.push({
      ...action,
      data: new useEditorChangeset.FlushData(batchId, data),
    });
  }

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

  return Object.assign(changeset, {
    flush,
  });
}

useEditorChangeset.FlushData = class EditorChangesetFlushData {
  constructor(
    public batchId: number,
    public data?: unknown,
  ) {}
};

export function useLazyEditorChangeset<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
  debounceMs: number | false,
) {
  const timerRef = useRef<number>(null);

  const changeset = useEditorChangeset(editor, (as) => {
    schedule();
    return as;
  });

  function schedule() {
    if (debounceMs === false) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => changeset.flush(), debounceMs);
  }

  return changeset;
}

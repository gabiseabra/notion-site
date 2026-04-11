import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { useCallback, useMemo, useRef } from "react";
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
) {
  const changesetRef = useRef({
    actions: [] as EditorActionCmd<TBlock>[],
    batchId: Math.random(),
    targetBefore: EditorTarget.empty<TBlock>(),
    targetAfter: EditorTarget.empty<TBlock>(),
  });

  useEventListener(editor.bus, "flush", (event) => {
    if (
      !(
        event.detail.data instanceof useEditorChangeset.FlushData &&
        event.detail.data.batchId === changesetRef.current.batchId
      )
    ) {
      changeset.flush();
    }
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

      flush(data?: unknown) {
        const { batchId } = changesetRef.current;
        const action = this.latest;

        if (!action) return;

        this.discard();

        editor.push({
          ...action,
          data: new useEditorChangeset.FlushData(batchId, data),
        });

        // if (
        //   selection &&
        //   (selection.start !== action.targetAfter.start ||
        //     selection.end !== action.targetAfter.end)
        // ) {
        // // because the current selection is different than the one that will
        // // commit. better handle this in auto-commit or smth....
        //   // @todo why update selection ? ? ?
        //   // editor.push({
        //   //   data,
        //   //   type: "focus",
        //   //   block: { id },
        //   //   selectionBefore: selectionAfter ?? selection,
        //   //   selectionAfter: selection,
        //   // });
        // }
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

        changesetRef.current.actions.push(...EditorAction.flat([action]));
      },

      peek(id) {
        const { batchId } = changesetRef.current;

        editor.flush(new useEditorChangeset.FlushData(batchId));

        return (
          EditorAction.applyCmd(
            changesetRef.current.actions,
            editor.history.getState(),
          ).find((b) => b.id === id) ?? null
        );
      },
    }),
    [editor],
  );

  return changeset;
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
  const changeset = useEditorChangeset(editor);
  const timerRef = useRef<number>(null);

  const schedule = useCallback(() => {
    if (debounceMs === false) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => changeset.flush(), debounceMs);
  }, [changeset]);

  return useMemo<EditorChangeset<TBlock>>(
    () => ({
      ...changeset,

      get latest() {
        return changeset.latest;
      },

      get hasUnsavedChanges() {
        return changeset.hasUnsavedChanges;
      },

      push(action) {
        schedule();

        return changeset.push(action);
      },
    }),
    [changeset],
  );
}

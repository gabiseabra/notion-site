import { WithRequired } from "@notion-site/common/types/object.js";
import { useRef } from "react";
import { SelectionRange } from "../../../utils/selection-range";
import { EditorAction } from "./editor-history";
import { ActionOptions, AnyBlock, ContentEditor, ID } from "./types";

type Changes<TBlock> = { block: TBlock } & Omit<ActionOptions, "batchId">;

type PendingChanges<TBlock> = { batchId: ID } & WithRequired<
  Changes<TBlock>,
  "selectionAfter" | "selectionBefore"
>;

/**
 * Tracks pending block changes from a plugin or toolbar component and groups them
 * into a single history entry on flush.
 *
 * Call `begin` at the start of a user gesture to declare the affected block and capture
 * the initial cursor position. Call `update` as changes accumulate. When the gesture ends,
 * call `flush` directly or debounce it with `schedule`. Switching to a different block
 * mid-gesture automatically flushes the previous one.
 *
 * Pass `debounceMs: false` for toolbar actions that should take effect right away — in
 * this mode every `update` commits immediately without batching.
 */
export function usePendingChanges<TBlock extends AnyBlock>({
  editor,
  debounceMs,
}: {
  editor: ContentEditor<TBlock>;
  debounceMs?: number | false;
}) {
  const pendingRef = useRef<PendingChanges<TBlock> | undefined>(undefined);
  const timerRef = useRef<number>(null);

  return Object.assign(pendingRef, {
    /** Closes the pending batch and pushes it to history. Records any cursor drift
     * since the last `update` so redo restores the exact caret position. */
    flush() {
      const pending = pendingRef.current;
      pendingRef.current = undefined;

      if (!pending) return;
      // try to read current selection to retore it later
      // if (pending) {
      const block = editor.peek(pending.block.id);
      const blockEl = editor.ref(pending.block.id);
      const selection = blockEl && SelectionRange.read(blockEl);

      if (
        block &&
        selection &&
        (selection.start !== pending.selectionAfter.start ||
          selection.end !== pending.selectionAfter.end)
      ) {
        editor.update(block, {
          ...pending,
          selectionBefore: pending.selectionAfter,
          selectionAfter: selection,
        });
      }

      return editor.flush(pending.data);
      // }

      // return editor.flush(data);
    },

    /** Cancels a pending scheduled flush. */
    cancel() {
      if (timerRef.current) clearTimeout(timerRef.current);
    },

    /** Schedules a `flush` after `debounceMs`. Resets the timer on each call. */
    schedule() {
      if (typeof debounceMs !== "number") return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => this.flush(), debounceMs);
    },

    /** Starts or resumes a pending change for a block. If a different block is already
     * pending, it is flushed first. Safe to call multiple times for the same block —
     * `selectionBefore` is preserved from the first call. */
    begin(changes: Omit<PendingChanges<TBlock>, "batchId">) {
      if (debounceMs === false) {
        return {
          ...changes,
          batchId: null,
        };
      }

      this.cancel();

      if (pendingRef.current?.block.id !== changes.block.id) this.flush();

      pendingRef.current ??= {
        ...changes,
        batchId: Math.random(),
      };

      return pendingRef.current;
    },

    /** Applies a new block state to the pending change and records it in the editor
     * batch. Commits immediately when `debounceMs` is `false`. */
    update({
      block,
      ...changes
    }: WithRequired<Changes<TBlock>, "selectionAfter">) {
      const pending = pendingRef.current;
      const selectionBefore =
        changes.selectionBefore ??
        pending?.selectionAfter ??
        (editor.history.action
          ? EditorAction.selectionAfter(editor.history.action)
          : undefined);
      const selectionAfter = changes.selectionAfter;

      editor.update(block, {
        ...pending,
        ...changes,
        selectionBefore,
        selectionAfter,
      });

      if (debounceMs === false) {
        editor.commit(changes.data ?? pending?.data);
      } else {
        pendingRef.current = {
          batchId: Math.random(),
          ...pending,
          ...changes,
          block,
          selectionBefore:
            selectionBefore ?? pending?.selectionAfter ?? selectionAfter,
          selectionAfter: selectionAfter,
        };
      }
    },
  });
}

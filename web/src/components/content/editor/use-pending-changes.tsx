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

    cancel() {
      if (timerRef.current) clearTimeout(timerRef.current);
    },

    schedule() {
      if (typeof debounceMs !== "number") return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => this.flush(), debounceMs);
    },

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

    update({
      block,
      ...changes
    }: WithRequired<Changes<TBlock>, "selectionAfter">) {
      const pending = pendingRef.current;
      const selectionBefore =
        changes.selectionBefore ??
        pending?.selectionAfter ??
        (editor.history.command
          ? EditorAction.selectionAfter(editor.history.command)
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

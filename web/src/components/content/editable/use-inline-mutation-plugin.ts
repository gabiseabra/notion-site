import { useCallback, useRef } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { SpliceRange } from "../../../utils/splice-range.js";
import { AnyBlock, ID } from "../editor/types.js";
import { createEventListenerPlugin } from "./create-event-listener-plugin.js";
import { ContentEditorPlugin } from "./types.js";

export type InlineMutationPluginOptions<TBlock extends AnyBlock> = {
  multiline?: boolean;
  debounceMs?: number;
  splice: (
    block: TBlock,
    offset: number,
    deleteCount: number,
    insert: string,
  ) => TBlock;
};

/**
 * Plugin that handles text input, preserving rich_text formatting.
 *
 * Uses native `beforeinput` to get inputType (React's synthetic event lacks it).
 */
export const useInlineMutationPlugin = <TBlock extends AnyBlock>({
  multiline,
  debounceMs = 200,
  splice,
}: InlineMutationPluginOptions<TBlock>): ContentEditorPlugin<TBlock> =>
  createEventListenerPlugin("beforeinput", (editor) => {
    const pendingRef = useRef<
      | {
          id: TBlock["id"];
          batchId: ID;
          selectionBefore: SelectionRange;
          selectionAfter: SelectionRange;
        }
      | undefined
    >(undefined);
    const timerRef = useRef<number>(null);

    const flush = useCallback(() => {
      pendingRef.current = undefined;

      return editor.flush("inline-mutation-plugin");
    }, [editor]);

    const cancelFlush = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const scheduleFlush = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, debounceMs);
    }, [flush]);

    return (block) => (e) => {
      cancelFlush();
      try {
        if (!(e.target instanceof HTMLElement)) return;

        const currentBlock = editor.peek(block.id);
        const actualSelection = SelectionRange.read(e.target);

        if (!actualSelection || !currentBlock) return;

        if (pendingRef.current?.id !== block.id) flush();
        pendingRef.current ??= {
          id: block.id,
          batchId: Math.random(),
          selectionBefore: actualSelection,
          selectionAfter: actualSelection,
        };

        const spliceRange = SpliceRange.fromInputEvent(
          e,
          e.target.textContent ?? "",
          pendingRef.current.selectionAfter,
        );

        if (!spliceRange) return;

        // skip newline if multiline is disabled
        if (spliceRange.insert === "\n" && !multiline) {
          e.preventDefault();
          return;
        }

        const selectionAfter = SpliceRange.toSelectionRange(spliceRange, 1);

        editor.update(
          splice(
            currentBlock,
            spliceRange.offset,
            spliceRange.deleteCount,
            spliceRange.insert,
          ),
          {
            data: "inline-mutation-plugin",
            batchId: pendingRef.current.batchId,
            selectionBefore: pendingRef.current.selectionAfter,
            selectionAfter,
          },
        );

        pendingRef.current.selectionAfter = selectionAfter;
      } finally {
        scheduleFlush();
      }
    };
  });

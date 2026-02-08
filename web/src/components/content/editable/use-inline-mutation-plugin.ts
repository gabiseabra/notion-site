import { useCallback, useRef } from "react";
import { useEventListener } from "../../../hooks/use-event-listener.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { SpliceRange } from "../../../utils/splice-range.js";
import { AnyBlock } from "../editor/types.js";
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
    // while the editor manages a list of blocks, users only edit one block at a time,
    // so we remember the state of only one block, and make sure to clean-up properly
    // before switching to another.
    const pendingRef = useRef<{
      block: TBlock;
      selectionBefore?: SelectionRange;
      selectionAfter?: SelectionRange;
    }>(null);

    const update = useCallback(
      (block: TBlock, selectionAfter: SelectionRange, element: HTMLElement) => {
        // if we switched to another block but there are still pending changes, we
        // need to save the changes for that block first.
        if (pendingRef.current && pendingRef.current.block.id !== block.id) {
          flush();
        }

        pendingRef.current ??= (() => {
          const selectionBefore = SelectionRange.read(element) ?? undefined;

          return {
            block,
            selectionBefore,
          };
        })();
        pendingRef.current.block = block;
        pendingRef.current.selectionAfter = selectionAfter;
      },
      [],
    );

    const flushTimerRef = useRef<number>(null);

    const flush = useCallback(() => {
      if (pendingRef.current) {
        const { block, selectionAfter, selectionBefore } = pendingRef.current;

        if (flushTimerRef.current) clearTimeout(flushTimerRef.current);

        editor.update(block, {
          data: "inline-mutation-plugin",
          selectionAfter,
          selectionBefore,
        });
        pendingRef.current = null;

        return true;
      } else {
        return false;
      }
    }, [editor]);

    const cancelFlush = useCallback(() => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    }, []);

    const scheduleFlush = useCallback(() => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = window.setTimeout(flush, debounceMs);
    }, [flush]);

    useEventListener(editor.bus, "flush", flush);

    return (block) => (e) => {
      cancelFlush();
      try {
        if (!(e.target instanceof HTMLElement)) return;

        const selection = SelectionRange.read(e.target);
        if (!selection) return;

        const spliceRange = SpliceRange.fromInputEvent(
          e,
          e.target.textContent ?? "",
          selection,
        );

        if (spliceRange?.insert === "\n" && !multiline) {
          e.preventDefault();
          return;
        }
        if (!spliceRange) return;

        const currentBlock =
          pendingRef.current?.block.id === block.id
            ? pendingRef.current.block
            : editor.peek(block.id);

        if (!currentBlock) return;

        // console.log("inline-mutation-plugin update", {
        //   currentBlock,
        //   spliceRange,
        //   selection,
        //   selectionAfter: SpliceRange.toSelectionRange(spliceRange, "redo"),
        // });

        update(
          splice(
            currentBlock,
            spliceRange.offset,
            spliceRange.deleteCount,
            spliceRange.insert,
          ),
          SpliceRange.toSelectionRange(spliceRange, "redo"),
          e.target,
        );
      } finally {
        scheduleFlush();
      }
    };
  });

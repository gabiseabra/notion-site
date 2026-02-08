import { useCallback, useRef } from "react";
import { useEventListener } from "../../../hooks/useEventListener.js";
import { getInputEventSpliceParams } from "../../../utils/event.js";
import { Selection } from "../../../utils/selection.js";
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
  debounceMs = 150,
  splice,
}: InlineMutationPluginOptions<TBlock>): ContentEditorPlugin<TBlock> =>
  createEventListenerPlugin("beforeinput", (editor) => {
    // while the editor manages a list of blocks, users only edit one block at a time,
    // so we remember the state of only one block, and make sure to clean-up properly
    // before switching to another.
    const pendingRef = useRef<{
      block: TBlock;
      selectionBefore?: Selection;
      selectionAfter?: Selection;
    }>(null);

    const update = useCallback((block: TBlock, selectionAfter: Selection) => {
      // if we switched to another block but there are still pending changes, we
      // need to save the changes for that block first.
      if (pendingRef.current && pendingRef.current.block.id !== block.id) {
        flush();
      }

      pendingRef.current ??= {
        block,
        selectionBefore:
          (() => {
            const element = editor.ref(block.id);
            return element && Selection.read(element);
          })() ?? undefined,
      };
      pendingRef.current.block = block;
      pendingRef.current.selectionAfter = selectionAfter;
    }, []);

    const flushTimerRef = useRef<number>(null);

    const flush = useCallback(() => {
      if (pendingRef.current) {
        if (flushTimerRef.current) clearTimeout(flushTimerRef.current);

        editor.update(pendingRef.current.block, {
          data: "inline-mutation-plugin",
          selectionAfter: pendingRef.current.selectionAfter,
          selectionBefore: pendingRef.current.selectionBefore,
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
        const selection = Selection.read(e.target as HTMLElement);
        if (!selection) return;

        const spliceParams = getInputEventSpliceParams(e, selection);

        if (spliceParams?.insert === "\n" && !multiline) {
          e.preventDefault();
          return;
        }
        if (!spliceParams) return;

        const currentBlock =
          pendingRef.current?.block.id === block.id
            ? pendingRef.current.block
            : editor.peek(block.id);

        if (!currentBlock) return;

        update(
          splice(
            currentBlock,
            spliceParams.offset,
            spliceParams.deleteCount,
            spliceParams.insert,
          ),
          {
            start: spliceParams.offset + spliceParams.insert.length,
            end: null,
          },
        );
      } finally {
        scheduleFlush();
      }
    };
  });

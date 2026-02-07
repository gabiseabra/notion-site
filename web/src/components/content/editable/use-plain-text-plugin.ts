import { useCallback, useRef } from "react";
import { useEventListener } from "../../../hooks/useEventListener.js";
import { getInputEventSpliceParams } from "../../../utils/event.js";
import { getSelectionRange, Selection } from "../../../utils/selection.js";
import { AnyBlock } from "../editor/types.js";
import { createEventListenerPlugin } from "./create-event-listener-plugin.js";
import { ContentEditorPlugin } from "./types.js";

const FLUSH_DEBOUNCE_MS = 150;

export type PlainTextPluginOptions<TBlock extends AnyBlock> = {
  multiline?: boolean;
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
export const usePlainTextPlugin = <TBlock extends { id: string }>({
  multiline,
  splice,
}: PlainTextPluginOptions<TBlock>): ContentEditorPlugin<TBlock> =>
  createEventListenerPlugin("beforeinput", (editor) => {
    const pendingRef = useRef<{
      block: TBlock;
      selectionBefore?: Selection;
      selectionAfter?: Selection;
    }>(null);

    const update = useCallback((block: TBlock, selection: Selection) => {
      if (pendingRef.current && pendingRef.current.block.id !== block.id) {
        flush();
      }

      pendingRef.current ??= {
        block,
        selectionBefore:
          (() => {
            const element = editor.ref(block.id);
            return element && getSelectionRange(element);
          })() ?? undefined,
      };
      pendingRef.current.block = block;
      pendingRef.current.selectionAfter = selection;
    }, []);

    const flushTimerRef = useRef<number>(null);

    const flush = useCallback(() => {
      if (pendingRef.current) {
        if (flushTimerRef.current) clearTimeout(flushTimerRef.current);

        editor.update(pendingRef.current.block, {
          selectionAfter: pendingRef.current.selectionAfter,
          selectionBefore: pendingRef.current.selectionBefore,
        });

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
      flushTimerRef.current = window.setTimeout(flush, FLUSH_DEBOUNCE_MS);
    }, [flush]);

    useEventListener(editor.bus, "flush", flush);
    useEventListener(
      editor.bus,
      "commit",
      useCallback(() => {
        pendingRef.current = null;
      }, []),
    );

    return (block) => (e) => {
      cancelFlush();
      try {
        const selection = getSelectionRange(e.target as HTMLElement);
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

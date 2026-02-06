import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import {
  extractBlock,
  mapBlock,
  narrowBlock,
} from "@notion-site/common/utils/notion/blocks.js";
import {
  getRichTextLength,
  spliceRichText,
} from "@notion-site/common/utils/notion/rich-text.js";
import { useCallback, useRef } from "react";
import { useEventListener } from "../../../hooks/useEventListener.js";
import { getInputEventSpliceParams } from "../../../utils/event.js";
import {
  getSelectionRange,
  Selection,
  setSelectionRange,
} from "../../../utils/selection.js";
import { composePlugins } from "./combinator/compose.js";
import { createEventListenerPlugin } from "./combinator/event-listener.js";
import { ContentEditorPlugin } from "./index.js";

const FLUSH_DEBOUNCE_MS = 150;
const COMMIT_DEBOUNCE_MS = 400;

/**
 * Plugin that handles text input, preserving rich_text formatting.
 *
 * Uses native `beforeinput` to get inputType (React's synthetic event lacks it).
 */
const flushPlugin = ({
  multiline,
}: PlainTextPluginOptions): ContentEditorPlugin =>
  createEventListenerPlugin("beforeinput", (editor) => {
    const pendingRef = useRef<{
      block: zNotion.blocks.block;
      selectionBefore?: Selection;
      selectionAfter?: Selection;
    }>(null);
    const timerRef = useRef<number>(null);

    const update = useCallback(
      (block: zNotion.blocks.block, selection: Selection) => {
        if (pendingRef.current && pendingRef.current.block.id !== block.id) {
          flush();
          pendingRef.current = null;
        }

        pendingRef.current ??= {
          block,
          selectionBefore:
            (() => {
              const element = editor.blocksRef.current.get(block.id);
              return element && getSelectionRange(element);
            })() ?? undefined,
        };
        pendingRef.current.block = block;
        pendingRef.current.selectionAfter = selection;
      },
      [],
    );

    const flush = useCallback(() => {
      if (pendingRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
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
      if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const scheduleFlush = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, FLUSH_DEBOUNCE_MS);
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
        const currentBlock =
          pendingRef.current && pendingRef.current.block.id === block.id
            ? pendingRef.current.block
            : block;

        if (
          !narrowBlock(currentBlock, ...zNotion.blocks.rich_text_type.options)
        )
          return;

        const selection = getSelectionRange(e.target as HTMLElement);
        if (!selection) return;

        const node = extractBlock(currentBlock);
        const rich_text = node.rich_text;
        const spliceParams = getInputEventSpliceParams(
          e,
          getRichTextLength(rich_text),
          selection,
        );

        if (spliceParams?.insert === "\n" && !multiline) {
          spliceParams.insert = "";
        }

        if (spliceParams) {
          const newBlock = mapBlock(currentBlock, (node) => ({
            ...node,
            rich_text: spliceRichText(
              rich_text,
              spliceParams.offset,
              spliceParams.deleteCount,
              spliceParams.insert,
            ),
          }));

          update(newBlock, {
            start: spliceParams.offset + spliceParams.insert.length,
            end: null,
          });

          return true;
        }
      } finally {
        scheduleFlush();
      }
    };
  });

const commitPlugin: ContentEditorPlugin = (editor) => {
  const commitTimerRef = useRef<number | null>(null);
  const scheduleCommit = useCallback(
    (block: zNotion.blocks.block) => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
      commitTimerRef.current = window.setTimeout(() => {
        const element = editor.blocksRef.current.get(block.id);
        const selection = element && getSelectionRange(element);

        if (element && selection && editor.isDirty) {
          commitTimerRef.current = null;
          editor.flush();
          editor.commit(() => setSelectionRange(element, selection));
        }
      }, COMMIT_DEBOUNCE_MS);
    },
    [editor],
  );

  return (block) => ({
    onKeyDown: () => {
      scheduleCommit(block);
    },
  });
};

export type PlainTextPluginOptions = {
  multiline?: boolean;
};

export const plainTextPlugin = (options: PlainTextPluginOptions) =>
  composePlugins(flushPlugin(options), commitPlugin);

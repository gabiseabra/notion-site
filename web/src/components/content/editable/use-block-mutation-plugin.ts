import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import {
  extractBlock,
  mapBlock,
  narrowBlock,
  splitBlock,
} from "@notion-site/common/utils/notion/blocks.js";
import {
  getMaxSelectionOffset,
  getSelectionRange,
  setSelectionRange,
} from "../../../utils/selection.js";
import { ContentEditorPlugin } from "./types.js";

/**
 * Plugin that handles block-level mutations: deletion and splitting.
 *
 * | Key | Condition | Action |
 * |-----|-----------|--------|
 * | `Backspace` | Caret at position 0 | Merge with previous or delete empty block |
 * | `Enter` | Any position | Split block at caret position |
 */
export const useBlockMutationPlugin: ContentEditorPlugin =
  (editor) => (block) => ({
    onKeyDown(e) {
      const selectionBefore = getSelectionRange(e.target as HTMLElement);
      if (!selectionBefore) return;

      if (
        e.key === "Backspace" &&
        selectionBefore.start === 0 &&
        selectionBefore.end === null
      ) {
        const index = editor.blocks.findIndex((b) => b.id === block.id);
        const prevBlock = editor.blocks[index - 1];
        const prevElement =
          prevBlock && editor.blocksRef.current.get(prevBlock.id);
        const currentBlock = editor.peek(block.id);

        if (
          !prevBlock ||
          !prevElement ||
          !currentBlock ||
          !narrowBlock(
            currentBlock,
            ...zNotion.blocks.rich_text_type.options,
          ) ||
          !narrowBlock(prevBlock, ...zNotion.blocks.rich_text_type.options)
        )
          return;

        const selectionAfter = {
          id: prevBlock.id,
          start: getMaxSelectionOffset(prevElement),
          end: null,
        };

        editor.transaction(() => {
          // merge any text on the tail of this block into the previous block
          editor.update(
            mapBlock(prevBlock, (node) => ({
              ...node,
              rich_text: [
                ...node.rich_text,
                ...extractBlock(currentBlock).rich_text,
              ],
            })),
          );
          editor.remove(currentBlock, {
            selectionBefore,
            selectionAfter,
          });
        });

        editor.commit();

        e.preventDefault();
      } else if (e.key === "Enter" && !e.shiftKey) {
        const currentBlock = editor.peek(block.id);

        if (!currentBlock) return;

        const { left, right } = splitBlock(
          currentBlock,
          selectionBefore.start,
          selectionBefore.end
            ? selectionBefore.start - selectionBefore.end
            : undefined,
        );

        editor.split(left, right, {
          selectionBefore,
          selectionAfter: { id: right.id, start: 0, end: null },
        });

        editor.commit((editor) => {
          const element = editor.ref(right.id);
          if (element) setSelectionRange(element, { start: 0, end: null });
        });

        e.preventDefault();
      }
    },
  });

import { Notion } from "@notion-site/common/utils/notion/index.js";
import {
  getMaxSelectionOffset,
  getSelectionRange,
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
export const useBlockMutationPlugin: ContentEditorPlugin<Notion.Block> =
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
          !Notion.Block.isRichText(currentBlock) ||
          !Notion.Block.isRichText(prevBlock)
        )
          return;

        const selectionAfter = {
          id: prevBlock.id,
          start: getMaxSelectionOffset(prevElement),
          end: null,
        };

        // merge any text on the tail of this block into the previous block
        editor.transaction(() => {
          editor.remove(currentBlock, {
            selectionBefore,
            selectionAfter,
          });
          editor.update(
            Notion.Block.map(prevBlock, (node) => ({
              ...node,
              rich_text: [
                ...node.rich_text,
                ...Notion.Block.extract(currentBlock).rich_text,
              ],
            })),
          );
        });

        editor.commit();

        e.preventDefault();
      } else if (e.key === "Enter" && !e.shiftKey) {
        const currentBlock = editor.peek(block.id);

        if (!currentBlock) return;

        const { left, right } = Notion.Block.split(
          currentBlock,
          selectionBefore.start,
          selectionBefore.end
            ? selectionBefore.start - selectionBefore.end
            : undefined,
        );

        editor.split(left, right, {
          selectionBefore,
          selectionAfter: { start: 0, end: null },
        });

        editor.commit();

        e.preventDefault();
      }
    },
  });

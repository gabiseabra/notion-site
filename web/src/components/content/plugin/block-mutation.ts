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
import { ContentEditorPlugin } from "./index.js";

/**
 * Plugin that handles block-level mutations: deletion and splitting.
 *
 * | Key | Condition | Action |
 * |-----|-----------|--------|
 * | `Backspace` | Caret at position 0 | Merge with previous or delete empty block |
 * | `Enter` | Any position | Split block at caret position |
 */
export const blockMutationPlugin: ContentEditorPlugin =
  (editor) => (block) => ({
    onKeyDown(e) {
      const selection = getSelectionRange(e.currentTarget);
      if (!selection) return;

      if (
        e.key === "Backspace" &&
        selection.start === 0 &&
        selection.end === null
      ) {
        const index = editor.blocks.findIndex((b) => b.id === block.id);
        const prevBlock = editor.blocks[index - 1];
        const prevElement =
          prevBlock && editor.blocksRef.current.get(prevBlock.id);

        if (!prevBlock || !prevElement) return;

        const nextSelection = {
          start: getMaxSelectionOffset(prevElement),
          end: null,
        };

        if (getMaxSelectionOffset(e.currentTarget) === 0) {
          // delete empty block
          editor.flush();
          editor.remove(block);
        } else {
          // merge with previous block
          if (
            !narrowBlock(block, ...zNotion.blocks.rich_text_type.options) ||
            !narrowBlock(prevBlock, ...zNotion.blocks.rich_text_type.options)
          )
            return;

          editor.flush();
          editor.transaction(() => {
            editor.update(
              mapBlock(prevBlock, (node) => ({
                ...node,
                rich_text: [
                  ...node.rich_text,
                  ...extractBlock(block).rich_text,
                ],
              })),
            );
            editor.remove(block);
          });
        }

        editor.commit((editor) => {
          const element = editor.blocksRef.current.get(prevBlock.id);
          if (element) {
            setSelectionRange(element, nextSelection);
          }
        });

        e.preventDefault();
      } else if (e.key === "Enter" && !e.shiftKey) {
        const { left, right } = splitBlock(
          block,
          selection.start,
          selection.end ? selection.start - selection.end : undefined,
        );

        editor.flush();
        editor.split(left, right);

        editor.commit((editor) => {
          const blockRef = editor.blocksRef.current.get(right.id);
          if (blockRef) setSelectionRange(blockRef, { start: 0, end: null });
        });

        e.preventDefault();
      }
    },
  });

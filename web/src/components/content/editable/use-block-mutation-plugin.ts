import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock } from "../editor/types.js";
import { ContentEditorPlugin } from "./types.js";

export type BlockMutationPluginOptions<TBlock> = {
  merge(left: TBlock, right: TBlock): TBlock | null;
  split(
    block: TBlock,
    offset: number,
    deleteRange: number,
  ): {
    left: TBlock;
    right: TBlock;
  } | null;
};

/**
 * Plugin that handles block-level mutations: deletion and splitting.
 *
 * | Key | Condition | Action |
 * |-----|-----------|--------|
 * | `Backspace` | Caret at position 0 | Merge with previous or delete empty block |
 * | `Enter` | Any position | Split block at caret position |
 */
export const useBlockMutationPlugin =
  <TBlock extends AnyBlock>({
    merge,
    split,
  }: BlockMutationPluginOptions<TBlock>): ContentEditorPlugin<TBlock> =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      const selectionBefore = SelectionRange.read(e.target as HTMLElement);
      if (!selectionBefore) return;

      if (
        e.key === "Backspace" &&
        // current selection is at the start of the block
        ((selectionBefore.start === 0 && selectionBefore.end === 0) ||
          // or the block only contains nbsp (is empty)
          e.currentTarget.textContent === String.fromCharCode(160))
      ) {
        const index = editor.blocks.findIndex((b) => b.id === block.id);
        const prevBlock = editor.blocks[index - 1];
        const prevElement =
          prevBlock && editor.blocksRef.current.get(prevBlock.id);
        const currentBlock = editor.peek(block.id);

        if (!prevBlock || !prevElement || !currentBlock) return;

        const mergedBlock = merge(prevBlock, currentBlock);
        const selectionAfter = {
          id: prevBlock.id,
          start: SelectionRange.maxOffset(prevElement),
          end: SelectionRange.maxOffset(prevElement),
        };

        if (!mergedBlock) return;

        // merge any text on the tail of this block into the previous block
        editor.transaction(
          () => {
            editor.remove(currentBlock);
            editor.update(mergedBlock);
          },
          {
            selectionAfter,
            selectionBefore: {
              id: currentBlock.id,
              ...selectionBefore,
            },
          },
        );

        editor.commit("block-mutation-plugin: merge");

        e.preventDefault();
      } else if (e.key === "Enter" && !e.shiftKey) {
        const currentBlock = editor.peek(block.id);

        if (!currentBlock) return;

        const splitBlocks = split(
          currentBlock,
          selectionBefore.start,
          Math.max(0, selectionBefore.end - selectionBefore.start),
        );

        if (!splitBlocks) return null;

        editor.split(splitBlocks.left, splitBlocks.right, {
          selectionBefore,
          selectionAfter: { start: 0, end: 0 },
        });
        editor.commit("block-mutation: split");

        e.preventDefault();
      }
    },
  });

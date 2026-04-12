import { runGenerator } from "@notion-site/common/utils/generator.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorActionCmd } from "../editor/editor-history";
import { EditorTarget } from "../editor/editor-target";
import { AnyBlock, ContentEditor, ID } from "../editor/types.js";
import { ContentEditorPlugin } from "./types.js";

export type BlockMutationPluginOptions<TBlock extends AnyBlock> = {
  split(
    block: TBlock,
    offset: number,
    deleteRange: number,
  ): {
    left: TBlock;
    right: TBlock;
  } | null;

  merge(left: TBlock, right: TBlock): TBlock | null;

  /**
   * Yields follow-up actions that get appended to a remove or split
   * action, letting callers keep dependent blocks in sync with the
   * structural change.
   */
  cascade?: (
    action: Extract<EditorActionCmd<TBlock>, { type: "remove" | "split" }>,
    editor: ContentEditor<TBlock>,
  ) => Generator<EditorActionCmd<TBlock>>;

  previous?: (
    block: TBlock,
    editor: ContentEditor<TBlock>,
  ) => { id: TBlock["id"]; childId?: ID } | null;
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
    split,
    merge,
    cascade,
    previous = (block, editor) =>
      EditorTarget.tab({ id: block.id }, editor, -1),
  }: BlockMutationPluginOptions<TBlock>): ContentEditorPlugin<TBlock> =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      const selectionBefore = SelectionRange.read(e.target as HTMLElement);
      if (!selectionBefore || e.defaultPrevented) return;

      if (
        e.key === "Backspace" &&
        // current selection is at the start of the block
        ((selectionBefore.start === 0 && selectionBefore.end === 0) ||
          // or the block only contains nbsp (is empty)
          e.currentTarget.textContent === String.fromCharCode(160))
      ) {
        const prev = previous(block, editor);
        const prevBlock =
          prev && editor.blocks.find((block) => block.id === prev.id);
        const prevElement = prevBlock && editor.ref(prevBlock.id).element;
        const currentBlock = editor.peek(block.id);

        if (!prevBlock || !prevElement || !currentBlock) return;

        const mergedBlock = merge(prevBlock, currentBlock);
        const tragetAfter = {
          id: prevBlock.id,
          childId: prev.childId,
          start: SelectionRange.maxOffset(prevElement),
          end: SelectionRange.maxOffset(prevElement),
        };

        if (!mergedBlock) return;

        const data = new useBlockMutationPlugin.MergeData();

        // merge any text on the tail of this block into the previous block
        editor.push({
          data,
          type: "apply",
          actions: [
            { type: "remove", block: currentBlock },
            { type: "update", block: mergedBlock },
            ...(cascade
              ? runGenerator(
                  cascade({ type: "remove", block: currentBlock }, editor),
                ).values
              : []),
          ],
          targetAfter: tragetAfter,
          targetBefore: { id: block.id, ...selectionBefore },
        });

        editor.commit(data);

        e.preventDefault();
      } else if (e.key === "Enter" && !e.shiftKey) {
        const currentBlock = editor.peek(block.id);

        if (!currentBlock) return;

        const offset = selectionBefore.start;
        const deleteRange = Math.max(
          0,
          selectionBefore.end - selectionBefore.start,
        );
        const splitBlocks = split(currentBlock, offset, deleteRange);

        if (!splitBlocks) return null;

        const data = new useBlockMutationPlugin.SplitData();

        editor.push({
          data,
          type: "apply",
          actions: [
            { type: "split", ...splitBlocks },
            ...(cascade
              ? runGenerator(cascade({ type: "split", ...splitBlocks }, editor))
                  .values
              : []),
          ],
          targetBefore: { id: currentBlock.id, ...selectionBefore },
          targetAfter: { id: splitBlocks.right.id, start: 0, end: 0 },
        });
        editor.commit(data);

        e.preventDefault();
      }
    },
  });

useBlockMutationPlugin.MergeData = class BlockMutationMergeData {};

useBlockMutationPlugin.SplitData = class BlockMutationSplitData {};

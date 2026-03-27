import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyContentEditorPlugin } from "./types.js";

/**
 * Plugin that enables arrow key navigation between blocks.
 *
 * | Key | Behavior |
 * |-----|----------|
 * | `ArrowLeft` | At start of block → move to end of previous block |
 * | `ArrowRight` | At end of block → move to start of next block |
 * | `ArrowUp` | Move to previous block, maintaining horizontal position |
 * | `ArrowDown` | Move to next block, maintaining horizontal position |
 */
export const useBlockNavigationPlugin: AnyContentEditorPlugin =
  (editor) => (block) => ({
    onKeyDown(e) {
      const selection = SelectionRange.read(e.currentTarget);

      if (e.shiftKey || !selection) return;

      const currentIndex = editor.blocks.findIndex((b) => b.id === block.id);
      const prevBlock = editor.blocks[currentIndex - 1];
      const prevElement = prevBlock && editor.ref(prevBlock.id).element;
      const nextBlock = editor.blocks[currentIndex + 1];
      const nextElement = nextBlock && editor.ref(nextBlock.id).element;

      switch (e.key) {
        case "ArrowLeft":
          if (!(prevElement && selection.start === 0 && selection.end === 0))
            return;

          prevElement.focus();
          SelectionRange.apply(prevElement, {
            start: SelectionRange.maxOffset(prevElement),
            end: SelectionRange.maxOffset(prevElement),
          });

          e.preventDefault();
          e.stopPropagation();

          return;

        case "ArrowRight":
          if (
            !(
              nextElement &&
              selection.start === SelectionRange.maxOffset(e.currentTarget) &&
              SelectionRange.isCollapsed(selection)
            )
          )
            return;

          nextElement.focus();
          SelectionRange.apply(nextElement, { start: 0, end: 0 });

          e.preventDefault();
          e.stopPropagation();

          return;

        case "ArrowUp": {
          if (!prevElement) return;
          const range = SelectionRange.moveVertically(
            e.currentTarget,
            prevElement,
            1,
          );
          if (!range) return;

          prevElement.focus();
          SelectionRange.apply(prevElement, range);

          e.preventDefault();
          e.stopPropagation();

          return;
        }

        case "ArrowDown": {
          if (!nextElement) return;
          const range = SelectionRange.moveVertically(
            e.currentTarget,
            nextElement,
            -1,
          );
          if (!range) return;

          nextElement.focus();
          SelectionRange.apply(nextElement, range);

          e.preventDefault();
          e.stopPropagation();

          return;
        }
      }
    },
  });

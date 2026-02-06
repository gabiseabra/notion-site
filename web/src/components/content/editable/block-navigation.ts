import {
  getMaxSelectionOffset,
  getSelectionRange,
  getVerticalNavigationRange,
  setSelectionRange,
} from "../../../utils/selection.js";
import { ContentEditorPlugin } from "./types.js";

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
export const useBlockNavigationPlugin: ContentEditorPlugin =
  (editor) => (block) => ({
    onKeyDown(e) {
      const selection = getSelectionRange(e.currentTarget);

      if (e.shiftKey || !selection) return;

      const currentIndex = editor.blocks.findIndex((b) => b.id === block.id);
      const prevBlock = editor.blocks[currentIndex - 1];
      const prevElement = prevBlock && editor.ref(prevBlock.id);
      const nextBlock = editor.blocks[currentIndex + 1];
      const nextElement = nextBlock && editor.ref(nextBlock.id);

      console.log({ currentIndex, prevBlock, nextBlock });
      switch (e.key) {
        case "ArrowLeft":
          if (!(prevElement && selection.start === 0 && selection.end === null))
            return;

          prevElement.focus();
          setSelectionRange(prevElement, {
            start: getMaxSelectionOffset(prevElement),
            end: null,
          });

          e.preventDefault();
          e.stopPropagation();

          return;

        case "ArrowRight":
          if (
            !(
              nextElement &&
              selection.start === getMaxSelectionOffset(e.currentTarget) &&
              selection.end === null
            )
          )
            return;

          nextElement.focus();
          setSelectionRange(nextElement, { start: 0, end: null });

          e.preventDefault();
          e.stopPropagation();

          return;

        case "ArrowUp": {
          if (!prevElement) return;
          const range = getVerticalNavigationRange(
            e.currentTarget,
            prevElement,
            "up",
          );
          if (!range) return;

          prevElement.focus();
          setSelectionRange(prevElement, range);

          e.preventDefault();
          e.stopPropagation();

          return;
        }

        case "ArrowDown": {
          if (!nextElement) return;
          const range = getVerticalNavigationRange(
            e.currentTarget,
            nextElement,
            "down",
          );
          if (!range) return;

          nextElement.focus();
          setSelectionRange(nextElement, range);

          e.preventDefault();
          e.stopPropagation();

          return;
        }
      }
    },
  });

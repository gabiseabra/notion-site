import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorCommand } from "../editor/editor-command.js";
import { AnyBlock, ID } from "../editor/types";
import { ContentEditorPlugin } from "./types.js";

/**
 * Creates a plugin that converts a block when the user types a recognized prefix followed by a space.
 *
 * Triggered on space input when the caret is positioned immediately after the prefix.
 * On trigger, the block is replaced with the result of `transform`.
 * If `transform` returns `undefined`, the conversion is skipped.
 *
 * @param regExp - Regex matched against the block's full text content.
 * @param char - Character that triggers the transform when inserted after the prefix.
 * @param transform - Command that produces the replacement block from the current block and regex match
 */
export const useRegExpTransformPlugin =
  <TBlock extends AnyBlock>(
    regExp: RegExp,
    char: string,
    transform: EditorCommand<TBlock, RegExpMatchArray>,
    targetAfter?: { childId?: ID; start: number; end: number },
  ): ContentEditorPlugin<TBlock> =>
  (editor) =>
  (block) => ({
    onInput(e) {
      if (e.nativeEvent.data !== char) return;

      const selection = SelectionRange.read(e.currentTarget);

      if (!selection || !SelectionRange.isCollapsed(selection)) return;

      const match = e.currentTarget.textContent?.match(regExp);
      const end = (match?.index ?? 0) + (match?.[0].length ?? 0) + 1;

      if (!match || end !== selection.start) return;

      const newBlock = transform({
        block: editor.peek(block.id) ?? block,
        data: match,
        editor,
      });

      if (!newBlock) return;

      const data = new useRegExpTransformPlugin.EventData();
      editor.push({
        data,
        type: "update",
        block: newBlock,
        targetBefore: { id: block.id, ...selection },
        targetAfter: { id: newBlock.id, start: 0, end: 0, ...targetAfter },
      });
      editor.commit(data);
    },
  });

useRegExpTransformPlugin.EventData = class RegExpTransformData {};

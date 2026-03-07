import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorSelection } from "./editor-selection.js";
import { AnyBlock, ContentEditor } from "./types.js";

export type EditorCommand<TBlock extends AnyBlock> = (
  block: TBlock,
  selection: SelectionRange,
  editor: ContentEditor<TBlock>,
) => TBlock | undefined | void;

export const execCommand = <TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
  maybeSelection?: EditorSelection<TBlock> | null,
) => {
  const selection =
    (typeof maybeSelection === "undefined"
      ? EditorSelection.read(editor)
      : maybeSelection) ?? undefined;

  return (fn: EditorCommand<TBlock>) => {
    const currentBlock = selection && editor.peek(selection.id);
    const newBlock = currentBlock && fn(currentBlock, selection, editor);

    if (newBlock) {
      editor.update(newBlock, {
        selectionBefore: selection,
        selectionAfter: selection,
      });
      editor.commit();
    }
  };
};

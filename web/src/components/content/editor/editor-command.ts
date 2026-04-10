import { Slot } from "../../../utils/slot";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor, ID } from "./types.js";

export type EditorCommand<
  TBlock extends AnyBlock,
  TData = EditorTarget<TBlock> | null,
> = (ctx: {
  block: TBlock;
  data: TData;
  editor: ContentEditor<TBlock>;
}) => TBlock | undefined | void;

export type ExecCommand<
  TBlock extends AnyBlock,
  TData = EditorTarget<TBlock>,
> = (command: EditorCommand<TBlock, TData>) => void;

export const ExecCommand =
  <TBlock extends AnyBlock, TData>(
    editor: ContentEditor<TBlock>,
    data: Slot<TData>,
    block?: TBlock,
    childId?: ID,
  ) =>
  (command: EditorCommand<TBlock, TData>) => {
    const selection = EditorTarget.read(editor);
    const currentBlock = block ?? (selection && editor.peek(selection.id));
    const newBlock =
      currentBlock &&
      command({
        block: currentBlock,
        data: Slot.extract(data, undefined),
        editor,
      });

    if (newBlock) {
      const isFocused =
        selection && selection.id === newBlock.id && childId === childId;

      editor.push({
        type: "update",
        block: newBlock,
        selectionBefore: isFocused ? selection : undefined,
        selectionAfter: isFocused ? selection : undefined,
      });
      editor.commit();
    }
  };

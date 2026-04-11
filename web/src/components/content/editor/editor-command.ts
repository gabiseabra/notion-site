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
    const currentTarget = EditorTarget.read(editor) ?? undefined;
    const currentBlock =
      block ?? (currentTarget && editor.peek(currentTarget.id));
    const newBlock =
      currentBlock &&
      command({
        block: currentBlock,
        data: Slot.extract(data, undefined),
        editor,
      });

    const target = block
      ? {
          id: block.id,
          childId,
          start: 0,
          end: 0,
        }
      : currentTarget;

    if (newBlock) {
      editor.push({
        type: "update",
        block: newBlock,
        targetBefore: target,
        targetAfter: target,
      });
      editor.commit();
    }
  };

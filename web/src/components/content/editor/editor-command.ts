import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor } from "./types.js";

export type EditorCommand<
  TBlock extends AnyBlock,
  TData = EditorTarget<TBlock>,
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
    data: TData,
    block?: TBlock,
  ) =>
  (command: EditorCommand<TBlock, TData>) => {
    const target = EditorTarget.read(editor);
    const selection = !target
      ? undefined
      : EditorTarget.isRange(target)
        ? target
        : { start: 0, end: 0 };
    const currentBlock = block ?? (target && editor.peek(target.id));
    const newBlock =
      currentBlock && command({ block: currentBlock, data, editor });

    if (newBlock) {
      editor.push({
        type: "update",
        block: newBlock,
        selectionBefore: selection,
        selectionAfter: selection,
      });
      editor.commit();
    }
  };

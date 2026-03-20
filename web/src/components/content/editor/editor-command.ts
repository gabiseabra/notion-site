import { EditorSelection } from "./editor-selection";
import { AnyBlock, ContentEditor } from "./types.js";

export type EditorCommand<
  TBlock extends AnyBlock,
  TData = EditorSelection<TBlock>,
> = (
  block: TBlock,
  selection: TData,
  editor: ContentEditor<TBlock>,
) => TBlock | undefined | void;

export type ExecCommand<
  TBlock extends AnyBlock,
  TData = EditorSelection<TBlock>,
> = (command: EditorCommand<TBlock, TData>) => void;

export const ExecCommand =
  <TBlock extends AnyBlock, TData>(
    editor: ContentEditor<TBlock>,
    data: TData,
    block?: TBlock,
  ) =>
  (command: EditorCommand<TBlock, TData>) => {
    const selection = EditorSelection.read(editor);
    const currentBlock = block ?? (selection && editor.peek(selection.id));
    const newBlock = currentBlock && command(currentBlock, data, editor);

    if (newBlock) {
      editor.update(newBlock, {
        selectionBefore:
          selection?.type === "range"
            ? selection
            : selection?.type === "focus"
              ? { start: 0, end: 0 }
              : undefined,
        selectionAfter:
          selection?.type === "range"
            ? selection
            : selection?.type === "focus"
              ? { start: 0, end: 0 }
              : undefined,
      });
      editor.commit();
    }
  };

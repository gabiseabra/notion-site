import { AnyBlock, ContentEditor } from "./types.js";

export type EditorCommand<TBlock extends AnyBlock, TData> = (
  block: TBlock,
  selection: TData,
  editor: ContentEditor<TBlock>,
) => TBlock | undefined | void;

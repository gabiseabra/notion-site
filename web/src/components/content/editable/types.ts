import { HTMLAttributes } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, ContentEditor } from "../editor/types.js";

type ReactEventHandlers<T> = {
  [K in keyof T as K extends `on${string}` ? K : never]: T[K];
};

/**
 * Any React event handler prop that a plugin can attach to a block’s editable
 * DOM element. These props are composed and spread onto that element.
 */
export type ContentEditableProps = ReactEventHandlers<
  HTMLAttributes<HTMLElement>
>;

/**
 * A plugin that extends the content editor's behavior.
 *
 * Plugins are curried functions following a two-phase pattern:
 * 1. **Editor phase**: Receives the editor instance, can use React hooks
 * 2. **Block phase**: Receives a block, returns DOM props for that block
 */
export type ContentEditorPlugin<
  TBlock extends AnyBlock,
  TDetail = ContentEditableProps,
> = (editor: ContentEditor<TBlock>) => (block: TBlock) => TDetail;

/** Generic ContentEditorPlugin that works for all types of blocks */
export type AnyContentEditorPlugin<TDetail = ContentEditableProps> = <
  TBlock extends AnyBlock,
>(
  editor: ContentEditor<TBlock>,
) => (block: TBlock) => TDetail;

export type EditorCommand<TBlock> = (
  block: TBlock,
  selection: SelectionRange,
) => TBlock | null;

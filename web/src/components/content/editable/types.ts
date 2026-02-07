import { FocusEvent, FormEvent, InputEvent, KeyboardEvent } from "react";
import { AnyBlock, ContentEditor } from "../editor/types.js";

/**
 * These props are spread onto the block's DOM element to enable editing.
 */
export type ContentEditableProps = {
  /**
   * Callback ref to register the block's DOM element.
   */
  ref?: (element: HTMLElement | null) => void;

  /**
   * The contentEditable mode for the element.
   * - `"plaintext-only"` prevents automatic rich text formatting.
   * - `undefined` for disabled.
   */
  contentEditable?: "plaintext-only" | undefined;
  suppressContentEditableWarning?: boolean;
  tabIndex?: number;

  /**
   * Keyboard event handler for navigation, shortcuts, etc.
   * Called on keydown before the browser processes the key.
   */
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;

  /**
   * Input event handler for content changes.
   * Called after the DOM has been updated with new content.
   */
  onInput?: (e: FormEvent<HTMLElement>) => void;

  /**
   * Before-input event handler for intercepting input.
   * Called before the DOM is updated, allows preventing input.
   */
  onBeforeInput?: (e: InputEvent<HTMLElement>) => void;

  onFocus?: (e: FocusEvent<HTMLElement>) => void;
  onBlur?: (e: FocusEvent<HTMLElement>) => void;
};

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

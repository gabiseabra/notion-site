import { FocusEvent, FormEvent, InputEvent, KeyboardEvent } from "react";
import { ContentEditorPlugin } from "../plugin/index.js";
import { ContentEditor } from "./use-content-editor.js";

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
 * Hook that bridges editor state and plugin system.
 * Applies a plugin to the editor, returning a block props factory.
 *
 * This hook executes Phase 1 of the plugin (editor setup) and returns
 * the Phase 2 function. The returned function should be called for each
 * block to get its editable props.
 *
 * ## Usage Flow
 *
 * ```
 * useContentEditor() → ContentEditor
 *                          ↓
 * useContentEditable(editor, plugin) → (block) => ContentEditableProps
 *                                          ↓
 * render: blocks.map(block => <Block {...editable(block)} />)
 * ```
 */
export function useContentEditable(
  editor: ContentEditor,
  plugin: ContentEditorPlugin,
) {
  return plugin(editor);
}

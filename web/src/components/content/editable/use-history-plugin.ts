import { KeyboardEvent, useEffect } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorCommand } from "../editor/editor-history.js";
import { AnyBlock, ContentEditor } from "../editor/types.js";
import { AnyContentEditorPlugin } from "./types.js";

/**
 * Plugin that handles undo/redo keyboard shortcuts and restores the default
 * selection inferred from history metadata.
 *
 * | Key | Behavior |
 * |-----|----------|
 * | `Ctrl+Z` | `Cmd+Z`: Undo
 * | `Ctrl+Shift+Z` | `Cmd+Shift+Z`: Redo
 * | `Ctrl+Y` | `Cmd+Y`: Redo (alternative)
 */
export const useHistoryPlugin: AnyContentEditorPlugin = (editor) => {
  useEffect(() => {
    const direction = editor.history.direction;
    const cmd = editor.history.command;
    if (!cmd) return;

    const id = EditorCommand.id(cmd, direction);
    const selection = EditorCommand.selection(cmd, direction);
    const element = editor.ref(id);
    const currentSelection = element && SelectionRange.read(element);

    if (!element || !selection) {
      console.warn("Failed to restore selection after commit.", element, {
        id,
        cmd,
        direction,
        revision: editor.revision,
        selection,
        currentSelection,
      });
      return;
    }

    if (
      selection.start === currentSelection?.start &&
      selection.end === currentSelection?.end
    )
      return;

    SelectionRange.apply(element, selection);
  });

  return (block) => ({
    onKeyDown(e) {
      const isMod = e.ctrlKey || e.metaKey;

      if (!isMod) return;

      if (isUndo(e)) {
        if (isUndoable(block.id, editor)) {
          editor.history.undo();
          editor.commit("history-plugin: undo");
        }

        e.preventDefault();
        return;
      }

      if (isRedo(e)) {
        if (isRedoable(block.id, editor)) {
          editor.history.redo();
          editor.commit("history-plugin: redo");
        }

        e.preventDefault();
        return;
      }
    },
  });
};

const isUndo = (e: KeyboardEvent) => e.key === "z" && !e.shiftKey;
const isUndoable = <TBlock extends AnyBlock>(
  id: TBlock["id"],
  editor: ContentEditor<TBlock>,
) => {
  editor.peek(id);
  return editor.history.position !== 0;
};
const isRedo = (e: KeyboardEvent) =>
  (e.key === "z" && e.shiftKey) || e.key === "y";
const isRedoable = <TBlock extends AnyBlock>(
  id: TBlock["id"],
  editor: ContentEditor<TBlock>,
) => {
  editor.peek(id);
  return editor.history.commands.length > editor.history.position;
};

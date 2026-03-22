import { KeyboardEvent, useEffect } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorAction } from "../editor/editor-history.js";
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
export const useHistoryPlugin = (): AnyContentEditorPlugin => (editor) => {
  useEffect(() => {
    const direction = editor.history.direction;
    const cmd = editor.history.action;
    if (!cmd) return;

    const id = EditorAction.id(cmd, direction);
    const selection = EditorAction.selection(cmd, direction);
    const element = editor.ref(id);
    const currentSelection = element && SelectionRange.read(element);

    if (!element || !selection) {
      console.warn("Failed to restore selection after commit.", {
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
  }, [editor]);

  return (block) => ({
    onKeyDown(e) {
      const isMod = e.ctrlKey || e.metaKey;

      if (!isMod) return;

      if (isUndo(e) && editor.peek(block.id) && editor.history.undo(true)) {
        editor.history.undo();
        editor.commit(new useHistoryPlugin.EventData("undo"));

        e.preventDefault();
        return;
      }

      if (isRedo(e) && editor.peek(block.id) && editor.history.redo(true)) {
        editor.history.redo();
        editor.commit(new useHistoryPlugin.EventData("redo"));

        e.preventDefault();
        return;
      }
    },
  });
};

const isUndo = (e: KeyboardEvent) => e.key === "z" && !e.shiftKey;
const isRedo = (e: KeyboardEvent) =>
  (e.key === "z" && e.shiftKey) || e.key === "y";

useHistoryPlugin.EventData = class HistoryEventData {
  constructor(public action: "undo" | "redo") {}
};

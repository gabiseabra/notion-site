import { useCallback } from "react";
import { useEventListener } from "../../../hooks/use-event-listener.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorCommand } from "../editor/history.js";
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
  useEventListener(
    editor.bus,
    "postcommit",
    useCallback(({ editor }) => {
      const cmd = editor.history.command;
      if (!cmd) return;

      const id = EditorCommand.id(cmd, editor.history.direction);
      const selection = {
        undo: cmd.selectionBefore,
        redo: cmd.selectionAfter,
      }[editor.history.direction];
      const element = editor.ref(id);
      const currentSelection = element && SelectionRange.read(element);
      if (
        !element ||
        !selection ||
        (selection.start === currentSelection?.start &&
          selection.end === currentSelection?.end)
      )
        return;

      SelectionRange.apply(element, selection);
    }, []),
  );

  return () => ({
    onKeyDown(e) {
      const cmd = editor.history.command;
      const isMod = e.ctrlKey || e.metaKey;

      if (!cmd || !isMod) return;

      if (e.key === "z" && !e.shiftKey) {
        if (!editor.history.undo()) return;
        editor.commit("history-plugin: undo");
        e.preventDefault();
        return;
      }

      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        if (!editor.history.redo()) return;

        editor.commit("history-plugin: redo");
        e.preventDefault();
        return;
      }
    },
  });
};

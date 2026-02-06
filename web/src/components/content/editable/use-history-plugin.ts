import { useCallback } from "react";
import { useEventListener } from "../../../hooks/useEventListener.js";
import {
  getSelectionRange,
  setSelectionRange,
} from "../../../utils/selection.js";
import { EditorCommand } from "../editor/history.js";
import { ContentEditorPlugin } from "./types.js";

/**
 * Plugin that handles undo/redo keyboard shortcuts.
 *
 * - `Ctrl+Z` / `Cmd+Z`: Undo
 * - `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo
 * - `Ctrl+Y` / `Cmd+Y`: Redo (alternative)
 */
export const useHistoryPlugin: ContentEditorPlugin = (editor) => {
  useEventListener(
    editor.bus,
    "push",
    useCallback(({ editor }) => {
      const cmd = editor.history.command;
      if (!cmd) return;

      const id = EditorCommand.id(cmd, editor.history.direction);
      const selection = {
        undo: cmd.selectionBefore,
        redo: cmd.selectionAfter,
      }[editor.history.direction];
      const element = editor.ref(id);
      const currentSelection = element && getSelectionRange(element);
      if (
        !element ||
        !selection ||
        (selection.start === currentSelection?.start &&
          selection.end === currentSelection?.end)
      )
        return;

      setSelectionRange(element, selection);
    }, []),
  );

  return () => ({
    onKeyDown(e) {
      const cmd = editor.history.command;
      const isMod = e.ctrlKey || e.metaKey;

      if (!cmd || !isMod) return;

      if (e.key === "z" && !e.shiftKey) {
        if (!editor.history.undo()) return;
        editor.commit();
        e.preventDefault();
        return;
      }

      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        if (!editor.history.redo()) return;

        editor.commit();
        e.preventDefault();
        return;
      }
    },
  });
};

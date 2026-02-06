import { setSelectionRange } from "../../../utils/selection.js";
import { ContentEditorPlugin } from "./index.js";

/**
 * Plugin that handles undo/redo keyboard shortcuts.
 *
 * - `Ctrl+Z` / `Cmd+Z`: Undo
 * - `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo
 * - `Ctrl+Y` / `Cmd+Y`: Redo (alternative)
 */
export const historyPlugin: ContentEditorPlugin = (editor) => () => ({
  onKeyDown(e) {
    const cmd = editor.history.action;
    const isMod = e.ctrlKey || e.metaKey;

    if (!cmd || !isMod) return;

    if (e.key === "z" && !e.shiftKey) {
      if (!editor.history.undo()) return;
      editor.commit((editor) => {
        const sel = cmd.selectionBefore;
        if (!sel) return;

        const element = editor.blocksRef.current.get(sel.id);
        if (!element) return;

        element.focus();
        setSelectionRange(element, sel);
      });
      e.preventDefault();
      return;
    }

    if ((e.key === "z" && e.shiftKey) || e.key === "y") {
      if (!editor.history.redo()) return;

      editor.commit((editor) => {
        const sel = cmd.selectionAfter;
        if (!sel) return;

        const element = editor.blocksRef.current.get(sel.id);
        if (!element) return;

        element.focus();
        setSelectionRange(element, sel);
      });
      e.preventDefault();
      return;
    }
  },
});

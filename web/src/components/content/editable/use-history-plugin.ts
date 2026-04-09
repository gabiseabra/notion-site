import { KeyboardEvent } from "react";
import { useEventListener } from "../../../hooks/use-event-listener";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorAction } from "../editor/editor-history.js";
import { AnyContentEditorPlugin } from "./types.js";

/**
 * Plugin that handles undo/redo keyboard shortcuts (on keydown) and restores
 * the default selection inferred from history metadata.
 * @note events and and selection restoration are scoped to the editor's managed
 *       blocks.
 *
 * | Key | Behavior |
 * |-----|----------|
 * | `Ctrl+Z` | `Cmd+Z`: Undo
 * | `Ctrl+Shift+Z` | `Cmd+Shift+Z`: Redo
 * | `Ctrl+Y` | `Cmd+Y`: Redo (alternative)
 */
export const useHistoryPlugin =
  (options?: {
    disabled?: boolean;
    restoreDisabled?: boolean;
    undoDisabled?: boolean;
    redoDisabled?: boolean;
  }): AnyContentEditorPlugin =>
  (editor) => {
    useEventListener(editor.bus, "postcommit", ({ editor }) => {
      if (options?.restoreDisabled || options?.disabled) return;

      const direction = editor.history.direction;
      const cmd = editor.history.action;

      if (!cmd) return;

      const { id, childId } =
        direction === 1
          ? EditorAction.targetAfter(cmd)
          : EditorAction.targetBefore(cmd);
      const selection =
        direction === 1
          ? EditorAction.selectionAfter(cmd)
          : EditorAction.selectionBefore(cmd);
      const { element } = editor.ref(id);
      const currentSelection = element && SelectionRange.read(element);

      if (childId) return;

      if (!selection) {
        console.warn(`Failed to restore selection on postcommit.`, {
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
        !element ||
        (selection.start === currentSelection?.start &&
          selection.end === currentSelection?.end)
      )
        return;

      SelectionRange.apply(element, selection);
    });

    return (block) => ({
      onKeyDown(e) {
        const isMod = e.ctrlKey || e.metaKey;

        if (!isMod) return;

        if (
          !(options?.undoDisabled || options?.disabled) &&
          isUndo(e) &&
          editor.history.undo(true) &&
          editor.peek(block.id)
        ) {
          editor.history.undo();
          editor.commit(new useHistoryPlugin.EventData("undo"));

          e.preventDefault();
          return;
        }

        if (
          !(options?.redoDisabled || options?.disabled) &&
          isRedo(e) &&
          editor.history.redo(true) &&
          editor.peek(block.id)
        ) {
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

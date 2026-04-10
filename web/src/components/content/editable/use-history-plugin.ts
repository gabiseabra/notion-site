import { KeyboardEvent } from "react";
import { useEventListener } from "../../../hooks/use-event-listener";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorAction } from "../editor/editor-history.js";
import { AnyBlock, ContentEditor } from "../editor/types";
import { composePlugins } from "./compose-plugins";
import { AnyContentEditorPlugin } from "./types.js";

/** Composed plugin that combines history restoration and undo/redo keyboard events. */
export const useHistoryPlugin = (options?: {
  /** When enabled, restores selection for child editors in addition to the main editor. */
  global?: boolean;
  disabled?: boolean;
  restoreDisabled?: boolean;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
}): AnyContentEditorPlugin =>
  composePlugins(
    useHistoryRestorationPlugin({
      global: options?.global,
      disabled: options?.restoreDisabled || options?.disabled,
    }),
    useHistoryEventsPlugin({
      disabled: options?.disabled,
      undoDisabled: options?.undoDisabled,
      redoDisabled: options?.redoDisabled,
    }),
  );

/** Plugin that handles undo (Cmd/Ctrl+Z) and redo (Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y) keyboard events. */
export const useHistoryEventsPlugin =
  (options?: {
    disabled?: boolean;
    undoDisabled?: boolean;
    redoDisabled?: boolean;
  }): AnyContentEditorPlugin =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      if (options?.disabled) return;

      const isMod = e.ctrlKey || e.metaKey;

      if (!isMod) return;

      if (!options?.undoDisabled && isUndo(e)) {
        e.preventDefault();

        if (editor.history.undo(true) && editor.peek(block.id)) {
          editor.history.undo();
          editor.commit(new useHistoryEventsPlugin.EventData("undo"));
          return;
        }
      }

      if (!options?.redoDisabled && isRedo(e)) {
        e.preventDefault();

        if (editor.history.redo(true) && editor.peek(block.id)) {
          editor.history.redo();
          editor.commit(new useHistoryEventsPlugin.EventData("redo"));
          return;
        }
      }
    },
  });

useHistoryEventsPlugin.EventData = class HistoryEventData {
  constructor(public action: "undo" | "redo") {}
};

/** Plugin that restores cursor selection to the correct position after an undo or redo. */
export const useHistoryRestorationPlugin =
  (options?: {
    global?: boolean;
    disabled?: boolean;
  }): AnyContentEditorPlugin =>
  (editor) => {
    useEventListener(editor.bus, "postcommit", ({ editor }) => {
      if (options?.disabled) return;

      restoreSelection(editor, options);
    });

    return () => ({});
  };

export function restoreSelection(
  editor: ContentEditor<AnyBlock>,
  options?: { global?: boolean },
) {
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
  const element = childId
    ? editor.ref(id).children.get(childId)
    : editor.ref(id).element;
  const currentSelection = element && SelectionRange.read(element);

  if (childId && !options?.global) return;

  if (
    !element ||
    !selection ||
    (element === document.activeElement &&
      selection.start === currentSelection?.start &&
      selection.end === currentSelection?.end)
  )
    return;

  SelectionRange.apply(element, selection);
}

/** Utilities */

const isUndo = (e: KeyboardEvent) => e.key === "z" && !e.shiftKey;
const isRedo = (e: KeyboardEvent) =>
  (e.key === "z" && e.shiftKey) || e.key === "y";

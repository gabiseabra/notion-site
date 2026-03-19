import { useRef } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorSelection } from "../editor/editor-selection.js";
import { AnyContentEditorPlugin } from "./types.js";

/**
 * Auto commits changes after input, debounced by `debounceMs`.
 *
 * Schedules a commit on each input event and only commits if the editor
 * is still dirty when the debounce timer fires.
 */
export const useAutoCommitPlugin =
  (debounceMs: number): AnyContentEditorPlugin =>
  (editor) => {
    const commitTimeoutRef = useRef<number>(null);

    const scheduleCommit = () => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = window.setTimeout(() => {
        if (editor.history.position <= editor.revision) return;

        const activeSelection = EditorSelection.read(editor);

        if (activeSelection) {
          editor.bus.addEventListener(
            "postcommit",
            () => {
              const element = editor.ref(activeSelection.id);
              if (element) SelectionRange.apply(element, activeSelection);
            },
            { once: true },
          );
        }

        editor.commit(new useAutoCommitPlugin.EventData());
      }, debounceMs);
    };

    return () => ({
      onInput() {
        scheduleCommit();
      },
    });
  };

useAutoCommitPlugin.EventData = class AutoCommitEventData {
  constructor() {}
};

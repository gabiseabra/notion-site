import { useRef } from "react";
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
        if (editor.history.position > editor.revision) {
          editor.commit(new useAutoCommitPlugin.EventData());
        }
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

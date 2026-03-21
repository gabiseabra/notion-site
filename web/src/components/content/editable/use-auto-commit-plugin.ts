import { useRef } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { EditorTarget } from "../editor/editor-target.js";
import { AnyContentEditorPlugin } from "./types.js";

/**
 * Auto commits changes after input, debounced by `debounceMs`.
 *
 * Schedules a commit on each input event and only commits if the editor
 * is still dirty when the debounce timer fires.
 */
export const useAutoCommitPlugin =
  (options?: {
    disabled?: boolean;
    debounceMs?: number;
  }): AnyContentEditorPlugin =>
  (editor) => {
    const commitTimeoutRef = useRef<number>(null);

    const scheduleCommit = () => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = window.setTimeout(() => {
        if (editor.history.position <= editor.revision) return;

        const target = EditorTarget.read(editor);
        const selection = target && EditorTarget.extractRange(target);

        if (selection) {
          editor.bus.addEventListener(
            "postcommit",
            () => {
              const element = editor.ref(target.id);
              if (element) SelectionRange.apply(element, selection);
            },
            { once: true },
          );
        }

        editor.commit(new useAutoCommitPlugin.EventData());
      }, options?.debounceMs);
    };

    if (options?.disabled) return () => ({});

    return () => ({
      onInput() {
        scheduleCommit();
      },
    });
  };

useAutoCommitPlugin.EventData = class AutoCommitEventData {
  constructor() {}
};

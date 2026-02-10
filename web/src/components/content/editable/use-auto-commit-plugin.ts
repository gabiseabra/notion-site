import { useRef } from "react";
import { AnyContentEditorPlugin } from "./types.js";

/**
 * Auto commits changes onKeyPress after so many ms.
 */
export const useAutoCommitPlugin =
  (debounceMs: number): AnyContentEditorPlugin =>
  (editor) => {
    const commitTimeoutRef = useRef<number>(null);

    const scheduleCommit = () => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = window.setTimeout(() => {
        if (editor.isDirty) {
          editor.commit("auto-commit-plugin");
        }
      }, debounceMs);
    };

    return () => ({
      onInput() {
        scheduleCommit();
      },
    });
  };

import { useEffect } from "react";
import { ContentEditorPlugin } from "./index.js";

/**
 * This plugin should typically be included first in any composition as it:
 * - Manages the block ref registry (maps block IDs to DOM elements)
 * - Enables block-level contentEditable functionality
 */
export const setupPlugin =
  ({ disabled }: { disabled?: boolean }): ContentEditorPlugin =>
  (editor) => {
    // clear refs on unmount
    useEffect(() => {
      return () => {
        editor.blocksRef.current.clear();
      };
    }, []);

    return (block) => ({
      ref(element) {
        editor.blocksRef.current.set(block.id, element);
      },

      // enable content enditable in the target block
      ...(disabled
        ? {}
        : {
            contentEditable: "plaintext-only",
            suppressContentEditableWarning: true,
            tabIndex: 0,
          }),
    });
  };

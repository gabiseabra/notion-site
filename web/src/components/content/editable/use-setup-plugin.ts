import { useEffect } from "react";
import { AnyContentEditorPlugin } from "./types.js";

/**
 * This plugin should typically be included first in any composition as it
 * manages the block ref registry (maps block IDs to DOM elements)
 */
export const useSetupPlugin: AnyContentEditorPlugin = (editor) => {
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
  });
};

import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { useEffect } from "react";
import { ContentEditorPlugin } from "./types.js";

/**
 * Creates a plugin that attaches a native DOM event listener to all editor blocks.
 *
 * @param eventType - DOM event type to listen for
 * @param plugin - Plugin that provides an `onEvent` handler per block
 */
export function createEventListenerPlugin<K extends keyof HTMLElementEventMap>(
  eventType: K,
  plugin: ContentEditorPlugin<(e: HTMLElementEventMap[K]) => void>,
): ContentEditorPlugin {
  return (editor) => {
    const editable = plugin(editor);

    useEffect(() => {
      const blocks = Array.from(editor.blocksRef.current.entries())
        .map(([id, element]) => {
          const block = editor.blocks.find((b) => b.id === id);
          return element && block ? { element, block } : null;
        })
        .filter(isNonNullable);

      return blocks.reduce(
        (next, { element, block }) => {
          if (!element) return next;

          function listener(e: HTMLElementEventMap[K]) {
            editable(block)(e);
          }

          element?.addEventListener(eventType, listener);

          return () => {
            element?.removeEventListener(eventType, listener);
            next();
          };
        },
        () => {},
      );
    }, [editor]);

    return () => ({});
  };
}

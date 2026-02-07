import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { useEffect } from "react";
import { AnyBlock } from "../editor/types.js";
import { ContentEditorPlugin } from "./types.js";

/**
 * Creates a plugin that attaches a native DOM event listener to all editor blocks.
 */
export function createEventListenerPlugin<
  TBlock extends AnyBlock,
  K extends keyof HTMLElementEventMap,
>(
  eventType: K,
  plugin: ContentEditorPlugin<TBlock, (e: HTMLElementEventMap[K]) => void>,
): ContentEditorPlugin<TBlock> {
  return (editor) => {
    const editable = plugin(editor);

    useEffect(() => {
      const blocks = Array.from(editor.blocksRef.current.entries())
        .map(([id, element]) => {
          const block = editor.blocks.find((b) => b.id === id);
          return element && block ? { element, block } : null;
        })
        .filter(isNonNullable);

      return blocks.reduce<() => void>(
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

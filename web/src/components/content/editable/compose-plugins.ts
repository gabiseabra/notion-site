import { ContentEditorPlugin } from "./types.js";

/**
 * Composes multiple plugins into a single plugin.
 *
 * The resulting plugin's event map is the intersection of all input plugins' event maps.
 *
 * @note Event handlers follow a "first wins" model: handlers are called in order
 * until one calls `e.stopPropagation()`, which stops the chain. This means
 * earlier plugins in the composition have priority.
 *
 * @param plugins - Plugins to compose, in priority order (first has highest priority)
 * @returns A single composed plugin with merged event maps
 */
export function composePlugins(
  ...plugins: ContentEditorPlugin[]
): ContentEditorPlugin {
  return (editor) => {
    const appliedPlugins = plugins.map((p) => p(editor));

    return (block) => {
      const handlers = appliedPlugins.map((p) => p(block));

      return {
        contentEditable: handlers.find((handler) => handler.contentEditable)
          ?.contentEditable,
        suppressContentEditableWarning: handlers.find(
          (handler) => handler.suppressContentEditableWarning,
        )?.suppressContentEditableWarning,
        tabIndex: handlers.reduce<number | undefined>(
          (acc, handler) => acc ?? handler.tabIndex,
          undefined,
        ),

        ref(e) {
          for (const { ref } of handlers) {
            ref?.(e);
          }
        },

        onKeyDown(e) {
          for (const { onKeyDown } of handlers) {
            onKeyDown?.(e);
            if (e.isPropagationStopped()) return;
          }
        },
        onInput(e) {
          for (const { onInput } of handlers) {
            onInput?.(e);
            if (e.isPropagationStopped()) return;
          }
        },
        onBeforeInput(e) {
          for (const { onBeforeInput } of handlers) {
            onBeforeInput?.(e);
            if (e.isPropagationStopped()) return;
          }
        },
        onFocus(e) {
          for (const { onFocus } of handlers) {
            onFocus?.(e);
            if (e.isPropagationStopped()) return;
          }
        },
        onBlur(e) {
          for (const { onBlur } of handlers) {
            onBlur?.(e);
            if (e.isPropagationStopped()) return;
          }
        },
      };
    };
  };
}

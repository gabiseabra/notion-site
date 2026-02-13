import { unique } from "@notion-site/common/utils/array.js";
import { keys } from "@notion-site/common/utils/object.js";
import { AnyBlock } from "../editor/types.js";
import { ContentEditableProps, ContentEditorPlugin } from "./types.js";

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
export function composePlugins<TBlock extends AnyBlock>(
  ...plugins: ContentEditorPlugin<TBlock>[]
): ContentEditorPlugin<TBlock> {
  return (editor) => {
    const appliedPlugins = plugins.map((p) => p(editor));

    return (block) => {
      const handlers = appliedPlugins.map((p) => p(block));

      const events = unique(handlers.flatMap((props) => keys(props)));

      return events.reduce<ContentEditableProps>((props, key) => {
        props[key] = (e) => {
          for (const _props of handlers) {
            // ugh....
            (_props[key] as ((event: typeof e) => void) | undefined)?.(e);
            if (e.isPropagationStopped()) return;
          }
        };
        return props;
      }, {});
    };
  };
}

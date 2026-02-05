import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { ContentEditableProps } from "../hooks/use-content-editable.js";
import { ContentEditor } from "../hooks/use-content-editor.js";
import { blockMutationPlugin } from "./block-mutation.js";
import { blockNavigationPlugin } from "./block-navigation.js";
import { composePlugins } from "./combinator/compose.js";
import { historyPlugin } from "./history.js";
import { plainTextPlugin } from "./plain-text.js";
import { setupPlugin } from "./setup.js";

/**
 * A plugin that extends the content editor's behavior.
 *
 * Plugins are curried functions following a two-phase pattern:
 * 1. **Editor phase**: Receives the editor instance, can use React hooks
 * 2. **Block phase**: Receives a block, returns DOM props for that block
 *
 * @typeParam TContext - Shared context between the plugins.
 * @typeParam TDetail  - Properties to replace the base block props.
 *                       Note that u have to handle this before using with
 *                      `useContentEditable` . . . for use in factories.
 */
export type ContentEditorPlugin<TDetail = ContentEditableProps> = (
  editor: ContentEditor,
) => (block: zNotion.blocks.block) => TDetail;

export const defaultPlugin = composePlugins(
  setupPlugin({}),
  historyPlugin,
  plainTextPlugin({ multiline: true }),
  blockNavigationPlugin,
  blockMutationPlugin,
);

export const inlineEditingPlugin = composePlugins(
  setupPlugin({}),
  historyPlugin,
  plainTextPlugin({ multiline: false }),
);

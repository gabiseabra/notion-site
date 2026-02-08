import { Notion } from "@notion-site/common/utils/notion/index.js";
import * as env from "../../../env.js";
import { ContentEditor } from "../editor/types.js";
import { composePlugins } from "./compose-plugins.js";
import { useBlockMutationPlugin } from "./use-block-mutation-plugin.js";
import { useBlockNavigationPlugin } from "./use-block-navigation-plugin.js";
import { useHistoryPlugin } from "./use-history-plugin.js";
import { useInlineMutationPlugin } from "./use-inline-mutation-plugin.js";
import { useLoggerPlugin } from "./use-logger-plugin.js";
import { useSetupPlugin } from "./use-setup-plugin.js";

export const useNotionPlugin = (
  editor: ContentEditor<Notion.Block>,
  options: {
    disabled?: boolean;
    multiline?: boolean;
    logging?: boolean | "verbose";
  } = {
    multiline: true,
    logging: env.DEV,
  },
) =>
  composePlugins<Notion.Block>(
    () => () =>
      options.disabled
        ? {}
        : {
            contentEditable: "plaintext-only",
            suppressContentEditableWarning: true,
            tabIndex: 0,
          },
    useLoggerPlugin((event) => {
      if (!options.logging) return;
      else if (options.logging == "verbose")
        console.info(event.eventType, event.detail, event.editor);
      else if (event.eventType !== "flush")
        console.info(event.eventType, event.detail, event.editor);
    }),
    useSetupPlugin,
    // useAutoCommitPlugin(600),
    useHistoryPlugin,
    useInlineMutationPlugin({
      multiline: options.multiline,
      splice(block, ...params) {
        if (!Notion.Block.isRichText(block)) return block;
        return Notion.Block.map(block, (node) => ({
          ...node,
          rich_text: Notion.RTF.splice(node.rich_text, ...params),
        }));
      },
      nbspFix(block) {
        return (
          Notion.Block.isRichText(block) &&
          Notion.RTF.getContent(Notion.Block.extract(block).rich_text) !==
            String.fromCharCode(160)
        );
      },
    }),
    useBlockNavigationPlugin,
    useBlockMutationPlugin({
      merge(left, right) {
        if (!Notion.Block.isRichText(left) || !Notion.Block.isRichText(right))
          return null;

        return Notion.Block.map(left, (node) => ({
          ...node,
          rich_text: [
            ...node.rich_text,
            ...Notion.Block.extract(right).rich_text,
          ],
        }));
      },
      split(block, offset, deleteRange) {
        if (!Notion.Block.isRichText(block)) return null;

        return Notion.Block.split(block, offset, deleteRange);
      },
    }),
  )(editor);

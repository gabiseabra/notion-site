import { Notion } from "@notion-site/common/utils/notion/index.js";
import * as env from "../../../../env.js";
import { EditorEvent } from "../../editor/editor-event.js";
import { composePlugins } from "../compose-plugins.js";
import { useAutoCommitPlugin } from "../use-auto-commit-plugin.js";
import { useBlockMutationPlugin } from "../use-block-mutation-plugin.js";
import { useBlockNavigationPlugin } from "../use-block-navigation-plugin.js";
import { useHistoryPlugin } from "../use-history-plugin.js";
import { useHotkeyPlugin } from "../use-hotkey-plugin.js";
import { useInlineMutationPlugin } from "../use-inline-mutation-plugin.js";
import { useLoggerPlugin } from "../use-logger-plugin.js";
import { toggleAnnotations } from "./commands.js";
import { useNotionPrefixPlugin } from "./use-notion-prefix-plugin.js";

export type NotionPluginOptions = {
  multiline?: boolean;
  logging?: boolean | "verbose";
  autoCommit?: number;
};

export const useNotionPlugin = (
  options: NotionPluginOptions = {
    multiline: true,
    logging: env.DEV,
  },
) =>
  composePlugins<Notion.Block>(
    useLoggerPlugin((event) => {
      if (!options.logging) return;
      else if (options.logging == "verbose")
        console.info(event.eventType, event.detail, event.editor);
      else if (!EditorEvent.narrow("edit", event) || !event.detail.batchId)
        console.info(event.eventType, event.detail, event.editor);
    }),
    useAutoCommitPlugin(options.autoCommit ?? 600),
    useHistoryPlugin(),
    useInlineMutationPlugin({
      multiline: options.multiline,
      splice(block, ...params) {
        if (!Notion.Block.isRichText(block)) return block;
        return Notion.Block.map(block, (node) => ({
          ...node,
          rich_text: Notion.RTF.splice(node.rich_text, ...params),
        }));
      },
    }),
    useBlockNavigationPlugin,
    useBlockMutationPlugin({
      merge(left, right) {
        if (
          !options.multiline ||
          !Notion.Block.isRichText(left) ||
          !Notion.Block.isRichText(right)
        )
          return null;

        return Notion.Block.map(left, (node) => ({
          ...node,
          rich_text: Notion.RTF.normalize([
            ...node.rich_text,
            ...Notion.Block.extract(right).rich_text,
          ]),
        }));
      },
      split(block, offset, deleteRange) {
        if (!options.multiline || !Notion.Block.isRichText(block)) return null;

        return Notion.Block.split(block, offset, deleteRange);
      },
    }),
    ...Object.values(NotionHotkeys).map(useHotkeyPlugin),
    useNotionPrefixPlugin("#", "heading_1"),
    useNotionPrefixPlugin("##", "heading_2"),
    useNotionPrefixPlugin("###", "heading_3"),
    useNotionPrefixPlugin("-", "bulleted_list_item"),
  );

const Mod = env.IS_MAC ? "Meta" : "Ctrl";

export const NotionHotkeys = {
  bold: {
    key: `${Mod}+b`,
    command: toggleAnnotations({ bold: true }),
  },
  underline: {
    key: `${Mod}+u`,
    command: toggleAnnotations({ underline: true }),
  },
  italic: {
    key: `${Mod}+i`,
    command: toggleAnnotations({ italic: true }),
  },
  strikethrough: {
    key: `${Mod}+Shift+s`,
    command: toggleAnnotations({ strikethrough: true }),
  },
} as const;

import { Notion } from "@notion-site/common/utils/notion/index.js";
import * as env from "../../../env.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { composePlugins } from "./compose-plugins.js";
import { useAutoCommitPlugin } from "./use-auto-commit-plugin.js";
import { useBlockMutationPlugin } from "./use-block-mutation-plugin.js";
import { useBlockNavigationPlugin } from "./use-block-navigation-plugin.js";
import { useHistoryPlugin } from "./use-history-plugin.js";
import { useHotkeyPlugin } from "./use-hotkey-plugin.js";
import { useInlineMutationPlugin } from "./use-inline-mutation-plugin.js";
import { useLoggerPlugin } from "./use-logger-plugin.js";

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
      else if (event.eventType !== "flush")
        console.info(event.eventType, event.detail, event.editor);
    }),
    useAutoCommitPlugin(options.autoCommit ?? 600),
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
    ...useNotionPlugin.Annotations.map((annotation) =>
      useHotkeyPlugin({
        key: annotation.key,
        apply: annotation.apply,
      }),
    ),
  );

const toggleAnnotation =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) => {
    if (!Notion.Block.isRichText(block) || selection.start === selection.end)
      return block;
    return Notion.Block.map(block, (node) => ({
      ...node,
      rich_text: Notion.RTF.toggleAnnotations(
        node.rich_text,
        annotations,
        selection.start,
        selection.end,
      ),
    }));
  };

const isAnnotated =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) => {
    return (
      Notion.Block.isRichText(block) &&
      Notion.RTF.isAnnotated(
        Notion.Block.extract(block).rich_text,
        annotations,
        selection.start,
        selection.end,
      )
    );
  };

const Mod = env.IS_MAC ? "Meta" : "Ctrl";

useNotionPlugin.Annotations = [
  {
    key: `${Mod}+b`,
    apply: toggleAnnotation({ bold: true }),
    isActive: isAnnotated({ bold: true }),
  },
  {
    key: `${Mod}+u`,
    apply: toggleAnnotation({ underline: true }),
    isActive: isAnnotated({ underline: true }),
  },
  {
    key: `${Mod}+i`,
    apply: toggleAnnotation({ italic: true }),
    isActive: isAnnotated({ italic: true }),
  },
  {
    key: `${Mod}+Shift+s`,
    apply: toggleAnnotation({ strikethrough: true }),
    isActive: isAnnotated({ strikethrough: true }),
  },
] as const;

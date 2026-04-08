import { Notion } from "@notion-site/common/utils/notion/index.js";
import * as env from "../../../../env.js";
import { composePlugins } from "../compose-plugins.js";
import { useAutoCommitPlugin } from "../use-auto-commit-plugin.js";
import { useBlockMutationPlugin } from "../use-block-mutation-plugin.js";
import { useBlockNavigationPlugin } from "../use-block-navigation-plugin.js";
import { useHistoryPlugin } from "../use-history-plugin.js";
import { useHotkeyPlugin } from "../use-hotkey-plugin.js";
import { useInlineMutationPlugin } from "../use-inline-mutation-plugin.js";
import { createLogger, useLoggerPlugin } from "../use-logger-plugin.js";
import { toggleAnnotations } from "./commands.js";
import { useNotionBackspacePlugin } from "./use-notion-backspace-plugin.js";
import { useNotionIndentPlugin } from "./use-notion-indent-plugin.js";
import { useNotionOrphanagePlugin } from "./use-notion-orphanage-plugin.js";
import { useNotionPrefixPlugin } from "./use-notion-prefix-plugin.js";

export type NotionPluginOptions = {
  inline?: boolean;
  logging?: boolean | "verbose";
  autoCommit?: number | boolean;
};

export const useNotionPlugin = ({
  inline = false,
  autoCommit = 600,
  logging = env.DEV && "verbose",
}: NotionPluginOptions = {}) =>
  composePlugins<Notion.Block>(
    useLoggerPlugin(createLogger(logging)),
    useAutoCommitPlugin({
      disabled: autoCommit === false,
      debounceMs: typeof autoCommit === "number" ? autoCommit : undefined,
    }),
    useHistoryPlugin(),
    useInlineMutationPlugin({
      // disable processing Enter to let block split handle it
      disabled: ({ event }) => !inline && event.inputType === "insertParagraph",
      splice(block, ...params) {
        return Notion.Block.mapRichText(block, (rich_text) =>
          Notion.RTF.splice(rich_text, ...params),
        );
      },
    }),
    useNotionBackspacePlugin,
    useNotionIndentPlugin({}),
    useBlockNavigationPlugin,
    useBlockMutationPlugin({
      merge(left, right) {
        if (
          inline ||
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
        if (inline || !Notion.Block.isRichText(block)) return null;

        return Notion.Block.split(block, offset, deleteRange);
      },
    }),
    useNotionPrefixPlugin,
    useNotionOrphanagePlugin,
    ...Object.values(NotionHotkeys).map(useHotkeyPlugin),
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

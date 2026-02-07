import { uuid } from "@notion-site/common/utils/uuid.js";
import { ContentEditor } from "../editor/types.js";
import { composePlugins } from "./compose-plugins.js";
import { useAutoCommitPlugin } from "./use-auto-commit-plugin.js";
import { useBlockMutationPlugin } from "./use-block-mutation-plugin.js";
import { useBlockNavigationPlugin } from "./use-block-navigation-plugin.js";
import { useHistoryPlugin } from "./use-history-plugin.js";
import { useInlineMutationPlugin } from "./use-inline-mutation-plugin.js";
import { useSetupPlugin } from "./use-setup-plugin.js";

export type PlainTextBlock = {
  id: string;
  content: string;
};

export const usePlainTextPlugin = (editor: ContentEditor<PlainTextBlock>) =>
  composePlugins<PlainTextBlock>(
    useSetupPlugin({}),
    useAutoCommitPlugin(600),
    useHistoryPlugin,
    useInlineMutationPlugin({
      splice: ({ id, content }, ...params) => ({
        id,
        content: [...content].splice(...params).join(""),
      }),
    }),
    useBlockNavigationPlugin,
    useBlockMutationPlugin({
      merge(left, right) {
        return { id: left.id, content: left.content + right.content };
      },
      split(block, offset, deleteRange) {
        return {
          left: {
            id: block.id,
            content: block.content.slice(0, offset),
          },
          right: {
            id: uuid(),
            content: block.content.slice(offset + deleteRange),
          },
        };
      },
    }),
  )(editor);

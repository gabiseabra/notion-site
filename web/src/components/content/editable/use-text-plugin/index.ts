import * as env from "../../../../env.js";
import { SpliceRange } from "../../../../utils/splice-range.js";
import { composePlugins } from "../compose-plugins.js";
import { useAutoCommitPlugin } from "../use-auto-commit-plugin.js";
import { useHistoryPlugin } from "../use-history-plugin.js";
import { useInlineMutationPlugin } from "../use-inline-mutation-plugin.js";
import { createLogger, useLoggerPlugin } from "../use-logger-plugin";

export type TextBlock = {
  id: string;
  value: string;
};

export const TextBlock = {
  create(id: string, value: string) {
    return { id, value };
  },
  extract(blocks: TextBlock[], newline = "\n\n") {
    return blocks.map((block) => block.value).join(newline);
  },
  splice(
    { id, value }: TextBlock,
    offset: number,
    deleteCount: number,
    insert: string,
  ) {
    return {
      id,
      value: SpliceRange.apply(value, { offset, deleteCount, insert }),
    };
  },
};

export type TextPluginOptions = {
  autoCommit?: number | boolean;
  logging?: boolean | "verbose";
};

/**
 * ContentEditor plugin stack for plain text blocks.
 */
export const useTextPlugin = ({
  autoCommit = true,
  logging = env.DEV,
}: TextPluginOptions = {}) =>
  composePlugins<TextBlock>(
    useLoggerPlugin(createLogger(logging)),
    useAutoCommitPlugin({
      disabled: autoCommit === false,
      debounceMs: typeof autoCommit === "number" ? autoCommit : undefined,
    }),
    useHistoryPlugin(),
    useInlineMutationPlugin({
      splice: TextBlock.splice,
      update: ({ id }, value) => ({ id, value }),
    }),
  );

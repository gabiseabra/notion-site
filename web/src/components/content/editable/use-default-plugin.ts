import * as env from "../../../env.js";
import { ContentEditor } from "../editor/use-content-editor.js";
import { useBlockNavigationPlugin } from "./block-navigation.js";
import { composePlugins } from "./compose-plugins.js";
import { useBlockMutationPlugin } from "./use-block-mutation-plugin.js";
import { useHistoryPlugin } from "./use-history-plugin.js";
import { useLoggerPlugin } from "./use-logger-plugin.js";
import { usePlainTextPlugin } from "./use-plain-text-plugin.js";
import { useSetupPlugin } from "./use-setup-plugin.js";

export const useDefaultPlugin = (
  editor: ContentEditor,
  options: {
    disabled?: boolean;
    multiline?: boolean;
    logging?: boolean | "verbose";
  } = {
    logging: !env.TEST,
  },
) =>
  composePlugins(
    useSetupPlugin({ disabled: options.disabled }),
    useHistoryPlugin,
    usePlainTextPlugin({ multiline: options.multiline }),
    useBlockNavigationPlugin,
    useBlockMutationPlugin,
    useLoggerPlugin((event) => {
      if (!options.logging) return;
      if (options.logging === "verbose" && event.eventType === "flush") return;
      console.info(event.eventType, event.detail);
    }),
  )(editor);

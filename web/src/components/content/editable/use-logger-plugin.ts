import chalk from "chalk";
import { useEventListener } from "../../../hooks/use-event-listener.js";
import { EditorEvent } from "../editor/editor-event.js";
import { AnyBlock } from "../editor/types.js";
import { ContentEditorPlugin } from "./types.js";

/**
 * A plugin that logs all editor events to a provided callback.
 */
export const useLoggerPlugin =
  <TBlock extends AnyBlock>(
    log: (event: EditorEvent<TBlock>) => void,
  ): ContentEditorPlugin<TBlock> =>
  (editor) => {
    useEventListener(editor.bus, "push", log);
    useEventListener(editor.bus, "commit", log);
    useEventListener(editor.bus, "postcommit", log);
    useEventListener(editor.bus, "flush", log);
    useEventListener(editor.bus, "ready", log);

    return () => ({});
  };

export const createLogger =
  (logging?: boolean | "verbose") =>
  <TBlock extends AnyBlock>(event: EditorEvent<TBlock>) => {
    if (!logging) return;
    else if (logging == "verbose") log(event);
    else if (
      !EditorEvent.narrow(event, "flush") &&
      !EditorEvent.narrow(event, "postcommit")
    )
      log(event);
  };

const GREY = "#797b86";
const LIGHT_GREY = "#f0f0f0";
const PINK = "#eb3f9b";
const LIGHT_PINK = "#ffd7f4";
const PURPLE = "#5850f3";
const LIGHT_PURPLE = "#e0d7ff";

const grey = chalk.bgHex(LIGHT_GREY).hex(GREY);
const secondary = chalk.bgHex(LIGHT_PINK).hex(PINK);
const primary = chalk.bgHex(LIGHT_PURPLE).hex(PURPLE);

const log = (event: EditorEvent<AnyBlock>) => {
  console.groupCollapsed(
    [
      primary.bold(`[${event.eventType}]`),
      "on",
      grey.italic(event.editor.id),
    ].join(" "),
  );
  console.info(secondary.bold("data"), event.detail.data);
  if (EditorEvent.narrow(event, "commit"))
    console.info(secondary.bold("blocks"), event.detail.blocks);
  if (EditorEvent.narrow(event, "push"))
    console.info(secondary.bold("action"), event.detail.action);
  console.info(secondary.bold("editor"), event.editor);
  console.groupEnd();
};

import { ANSI } from "@notion-site/common/utils/ansi.js";
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

const log = (event: EditorEvent<AnyBlock>) => {
  console.groupCollapsed(
    [
      ANSI.primary(`[${event.eventType}]`),
      "on",
      ANSI.gray(`[${event.editor.id}]`),
    ].join(" "),
  );
  console.info(ANSI.secondary("[data]"), event.detail.data);
  if (EditorEvent.narrow(event, "commit"))
    console.info(ANSI.secondary("[blocks]"), event.detail.blocks);
  if (EditorEvent.narrow(event, "push"))
    console.info(ANSI.secondary("[action]"), event.detail.action);
  console.info(ANSI.secondary("[editor]"), event.editor);
  console.groupEnd();
};

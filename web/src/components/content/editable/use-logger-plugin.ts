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
    else if (logging == "verbose")
      console.info(event.eventType, event.detail, event.editor);
    else if (
      !EditorEvent.narrow("flush", event) &&
      !EditorEvent.narrow("postcommit", event)
    )
      console.info(event.eventType, event.detail, event.editor);
  };

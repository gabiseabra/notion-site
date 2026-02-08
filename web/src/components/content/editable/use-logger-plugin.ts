import { useEventListener } from "../../../hooks/use-event-listener.js";
import { EditorEvent } from "../editor/event.js";
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
    useEventListener(editor.bus, "edit", log);
    useEventListener(editor.bus, "commit", log);
    useEventListener(editor.bus, "postcommit", log);
    useEventListener(editor.bus, "flush", log);
    useEventListener(editor.bus, "reset", log);
    useEventListener(editor.bus, "ready", log);

    return () => ({});
  };

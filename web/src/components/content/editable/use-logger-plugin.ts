import { useEventListener } from "../../../hooks/useEventListener.js";
import { EditorEvent } from "../editor/event.js";
import { ContentEditorPlugin } from "./types.js";

export const useLoggerPlugin =
  (log: (event: EditorEvent) => void): ContentEditorPlugin =>
  (editor) => {
    useEventListener(editor.bus, "edit", log);
    useEventListener(editor.bus, "commit", log);
    useEventListener(editor.bus, "push", log);
    useEventListener(editor.bus, "flush", log);
    useEventListener(editor.bus, "reset", log);

    return () => ({});
  };

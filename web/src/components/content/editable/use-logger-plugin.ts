import { useEventListener } from "../../../hooks/useEventListener.js";
import { EditorEvent } from "../editor/event.js";
import { AnyBlock } from "../editor/types.js";
import { ContentEditorPlugin } from "./types.js";

export const useLoggerPlugin =
  <TBlock extends AnyBlock>(
    log: (event: EditorEvent<TBlock>) => void,
  ): ContentEditorPlugin<TBlock> =>
  (editor) => {
    useEventListener(editor.bus, "edit", log);
    useEventListener(editor.bus, "commit", log);
    useEventListener(editor.bus, "push", log);
    useEventListener(editor.bus, "flush", log);
    useEventListener(editor.bus, "reset", log);
    useEventListener(editor.bus, "ready", log);

    return () => ({});
  };

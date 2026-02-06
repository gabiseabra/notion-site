import { TypedEventTarget } from "typescript-event-target";
import { ContentEditor } from "./use-content-editor.js";

export type EventMap = { [k: string]: Event };

export interface EditorEventMap extends EventMap {
  flush: EditorEvent;
  commit: EditorEvent;
}

export class EditorEvent extends Event {
  constructor(
    type: keyof EditorEventMap & string,
    public editor: ContentEditor,
  ) {
    super(type);
  }
}

export class EditorEventTarget extends TypedEventTarget<EditorEventMap> {}

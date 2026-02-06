import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { EmptyObject } from "@notion-site/common/types/object.js";
import { TypedEventTarget } from "typescript-event-target";
import { EditorCommandCmd } from "./history.js";
import { ContentEditor } from "./use-content-editor.js";

type EditorEventMap = {
  /** Command will be pushed to history. */
  edit: EditorCommandCmd;
  /** Snapshot of history will be saved to state. */
  commit: zNotion.blocks.block[];
  /** DOM has been updated. */
  push: EmptyObject;
  /** Notify plugins to save changes before commit. */
  flush: EmptyObject;
  /** You have reached the end of history. */
  reset: EmptyObject;
};

export class EditorEvent<
  T extends keyof EditorEventMap = keyof EditorEventMap,
> extends Event {
  constructor(
    public eventType: T,
    public editor: ContentEditor,
    public detail: EditorEventMap[T],
  ) {
    super(eventType);
  }
}

export class EditorEventTarget extends TypedEventTarget<{
  [T in keyof EditorEventMap]: EditorEvent<T>;
}> {}

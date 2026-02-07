import { EmptyObject } from "@notion-site/common/types/object.js";
import { TypedEventTarget } from "typescript-event-target";
import { EditorCommandCmd } from "./history.js";
import { AnyBlock, ContentEditor } from "./types.js";

type EditorEventMap<TBlock extends AnyBlock> = {
  /** Command will be pushed to history. */
  edit: EditorCommandCmd<TBlock>;
  /** Snapshot of history will be saved to state. */
  commit: {
    blocks: TBlock[];
    revision: number;
  };
  /** DOM has been updated. */
  push: EmptyObject;
  /** Notify plugins to save changes before commit. */
  flush: EmptyObject;
  /** You have reached the end of history. */
  reset: EmptyObject;
  /** Fired once after editor setup is done. */
  ready: EmptyObject;
};

export class EditorEvent<
  TBlock extends AnyBlock,
  E extends keyof EditorEventMap<TBlock> = keyof EditorEventMap<TBlock>,
> extends Event {
  constructor(
    public eventType: E,
    public editor: ContentEditor<TBlock>,
    public detail: EditorEventMap<TBlock>[E],
  ) {
    super(eventType);
  }
}

export class EditorEventTarget<
  TBlock extends AnyBlock,
> extends TypedEventTarget<{
  [E in keyof EditorEventMap<TBlock>]: EditorEvent<TBlock, E>;
}> {}

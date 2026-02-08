import { EmptyObject } from "@notion-site/common/types/object.js";
import { TypedEventTarget } from "typescript-event-target";
import { EditorCommandCmd } from "./editor-history.js";
import { AnyBlock, ContentEditor } from "./types.js";

type EditorEventMap<TBlock extends AnyBlock> = {
  /**
   * Command will be pushed to history.
   * @cancellable
   */
  edit: {
    cmd: EditorCommandCmd<TBlock>;
    inTransaction: boolean;
    /** Data provided from the plugin that triggers it. You have to parse it */
    data: unknown;
  };
  /**
   * Snapshot of history will be saved to state.
   * @cancellable
   */
  commit: {
    blocks: TBlock[];
    revision: number;
    /** Data provided from the plugin that triggers it. You have to parse it */
    data: unknown;
  };
  /**
   * Runs after all plugin and editor effects, after the DOM has been updated from a commit.
   */
  postcommit: EmptyObject;
  /**
   * Notifies plugins to save changes before commit. Runs before commit.
   */
  flush: EmptyObject;
  /**
   * You have reached the end of history.
   */
  reset: EmptyObject;
  /**
   * Runs once after editor setup is done.
   */
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

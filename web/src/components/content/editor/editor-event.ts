import { EmptyObject } from "@notion-site/common/types/object.js";
import { TypedEventTarget } from "typescript-event-target";
import { EditorAction } from "./editor-history.js";
import { AnyBlock, ContentEditor } from "./types.js";

type EditorEventMap<TBlock extends AnyBlock> = {
  /**
   * Notify plugins to save changes to history.
   */
  flush: {
    /** Data provided from the plugin that triggers it. You have to parse it */
    data: unknown;
  };
  /**
   * Command will be pushed to history.
   * @cancellable
   */
  push: {
    action: EditorAction<TBlock>;
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
    super(eventType, { cancelable: true });
  }

  static narrow<
    E extends keyof EditorEventMap<TBlock>,
    TBlock extends AnyBlock,
  >(event: EditorEvent<TBlock>, eventType: E): event is EditorEvent<TBlock, E> {
    return event.eventType === eventType;
  }
}

export class EditorEventTarget<
  TBlock extends AnyBlock,
> extends TypedEventTarget<{
  [E in keyof EditorEventMap<TBlock>]: EditorEvent<TBlock, E>;
}> {}

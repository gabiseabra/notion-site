import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { WithOptional } from "@notion-site/common/types/object.js";
import { isNonEmpty } from "@notion-site/common/utils/non-empty.js";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { TypedEventTarget } from "typescript-event-target";
import { History } from "../../../utils/history.js";
import { Selection } from "../../../utils/selection.js";

/**
 * Optional selection overrides for editor commands.
 * If not provided, defaults to current DOM selection.
 */
export type SelectionOptions = {
  /** Selection before the change (for undo). */
  selectionBefore?: WithOptional<BlockSelection, "id">;
  /** Selection after the change (for redo). */
  selectionAfter?: WithOptional<BlockSelection, "id">;
};

/**
 * Shared state passed to plugins in their editor setup phase.
 *
 * @typeParam TEventMap - Map of event type names to Event classes. Defaults to
 * `Record<string, never>` which errors if you try to use events without typing.
 */
export type ContentEditor = {
  blocks: Blocks;
  /** Block ID → DOM element. Populated by plugins via the `ref` prop. */
  blocksRef: RefObject<Map<string, HTMLElement | null>>;
  /** Typed event target for plugin communication. */
  bus: TypedEventTarget<EditorEventMap>;
  /** Command history for undo/redo. */
  history: History<Blocks, EditorCommand>;

  isDirty: boolean;

  /** Replace a block by ID. Pushes to history. */
  update(block: Block, options?: SelectionOptions): void;
  /** Remove a block by ID. Pushes to history. */
  remove(block: Block, options?: SelectionOptions): void;
  /** Replace block `left` with `[left, right]`. Pushes to history. */
  split(left: Block, right: Block, options?: SelectionOptions): void;
  /** Batch multiple operations as a single history entry. */
  transaction(fn: () => void): void;
  /** Notify plugins to commit pending changes, returning true if the event was handled. */
  flush(): boolean;
  /** Commit the current state of history to DOM. Callback runs after render is done. */
  commit(afterCommit?: (editor: ContentEditor) => void): void;
};

/**
 * Creates shared state for the editor plugins.
 *
 * @typeParam TEventMap - Map of event types. Must be explicitly provided when
 * using plugins that emit events.
 */
export function useContentEditor({
  initialValue,
}: {
  initialValue: Blocks;
}): ContentEditor {
  const bus = useMemo(() => new TypedEventTarget<EditorEventMap>(), []);
  const history = useMemo(
    () => new History<Blocks, EditorCommand>(initialValue, applyCommand),
    [],
  );
  const [snapshot, setSnapshot] = useState(() => history.snapshot());

  const blocksRef = useRef<Map<string, HTMLElement | null>>(new Map());
  const txRef = useRef<EditorCommand[] | null>(null);
  const postCommitRef = useRef<((editor: ContentEditor) => void)[]>([]);

  const editorRef = useRef<ContentEditor>(null);
  const editor = useMemo<ContentEditor>(
    () => ({
      blocks: snapshot.state,
      blocksRef,
      bus,
      history,

      get isDirty() {
        return history.currentPosition !== snapshot.position;
      },

      update(block, options) {
        const cmd: EditorCommand = {
          type: "update",
          block,
          selectionBefore: options?.selectionBefore
            ? { id: block.id, ...options.selectionBefore }
            : undefined,
          selectionAfter: options?.selectionAfter
            ? { id: block.id, ...options.selectionAfter }
            : undefined,
        };
        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      remove(block, options) {
        const cmd: EditorCommand = {
          type: "remove",
          block,
          selectionBefore: options?.selectionBefore
            ? { id: block.id, ...options.selectionBefore }
            : undefined,
          selectionAfter: options?.selectionAfter
            ? { id: block.id, ...options.selectionAfter }
            : undefined,
        };
        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      split(left, right, options) {
        const cmd: EditorCommand = {
          type: "split",
          left,
          right,
          selectionBefore: options?.selectionBefore
            ? { id: left.id, ...options.selectionBefore }
            : undefined,
          selectionAfter: options?.selectionAfter
            ? { id: right.id, ...options.selectionAfter }
            : undefined,
        };
        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      transaction(fn) {
        txRef.current = [];
        fn();
        const commands = txRef.current;
        txRef.current = null;
        if (isNonEmpty(commands)) {
          history.push({
            type: "apply",
            commands,
            selectionBefore: commands.find((cmd) => cmd.selectionBefore)
              ?.selectionBefore,
            selectionAfter: [...commands]
              .reverse()
              .find((cmd) => cmd.selectionAfter)?.selectionAfter,
          });
        }
      },

      flush() {
        return (
          !!editorRef.current &&
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", editorRef.current),
          )
        );
      },

      commit(afterCommit = () => {}) {
        postCommitRef.current.push(afterCommit);
        setSnapshot(history.snapshot());
      },
    }),
    [snapshot, bus, history],
  );
  editorRef.current = editor;

  useEffect(() => {
    const callbacks = postCommitRef.current;
    if (callbacks.length) {
      bus.dispatchTypedEvent("commit", new EditorEvent("commit", editor));
      callbacks.forEach((fn) => fn(editor));
      postCommitRef.current = [];
    }
  }, [snapshot]);

  return editor;
}

/** Event listener stuff */

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

/** History sutff */

type Block = zNotion.blocks.block;
type Blocks = Block[];

type BlockSelection = { id: string } & Selection;

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorCommand =
  | {
      type: "update";
      block: Block;
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    }
  | {
      type: "remove";
      block: Pick<Block, "id">;
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    }
  | {
      type: "split";
      left: Block;
      right: Block;
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    }
  | {
      type: "apply";
      commands: EditorCommand[];
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    };

/**
 * Applies a command to the blocks state.
 */
function applyCommand(blocks: Blocks, cmd: EditorCommand): Blocks {
  switch (cmd.type) {
    case "update":
      return blocks.map((b) => (b.id === cmd.block.id ? cmd.block : b));
    case "remove":
      return blocks.filter((b) => b.id !== cmd.block.id);
    case "split": {
      const index = blocks.findIndex((b) => b.id === cmd.left.id);
      if (index === -1) return blocks;
      const result = [...blocks];
      result.splice(index, 1, cmd.left, cmd.right);
      return result;
    }
    case "apply":
      return cmd.commands.reduce(applyCommand, blocks);
  }
}

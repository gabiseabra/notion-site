import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { WithOptional } from "@notion-site/common/types/object.js";
import { isNonEmpty } from "@notion-site/common/utils/non-empty.js";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { TypedEventTarget } from "typescript-event-target";
import { History } from "../../../utils/history.js";
import {
  getSelectionRange,
  Selection,
  setSelectionRange,
} from "../../../utils/selection.js";

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
  /** Current snapshot of the state */
  blocks: Blocks;
  /** Changes every time that the snapshot is updated (so react is going to update) */
  revision: number;
  /** Block ID → DOM element. Populated by plugins via the `ref` prop. */
  blocksRef: RefObject<Map<string, HTMLElement | null>>;
  /** Event target for editor commands. */
  bus: TypedEventTarget<EditorEventMap>;
  /** Command history for undo/redo. */
  history: History<Blocks, EditorCommand>;
  /**
   * True if the current snapshot is stale.
   * Need to flush before making changes if you're reading from blocks.
   */
  isDirty: boolean;

  // Helpers to read blocks from state

  /** Returns block data from the current snapshot by id. */
  get(id: string): Block | null;
  /** Flushes pending changes if needed, then returns block data from the latest history state. */
  peek(id: string): Block | null;
  /** Returns block's registered DOM element by id. */
  ref(id: string): HTMLElement | null;

  // Methods to update the state

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

  const editorRef = useRef<ContentEditor>(null);
  const editor = useMemo<ContentEditor>(
    () => ({
      blocks: snapshot.state,
      revision: snapshot.position,
      blocksRef,
      bus,
      history,

      get isDirty() {
        return history.currentPosition !== snapshot.position;
      },

      get(id) {
        return snapshot.state.find((block) => block.id === id) ?? null;
      },

      peek(id) {
        editorRef.current?.flush();
        if (editorRef.current?.isDirty) {
          return history.getState().find((block) => block.id === id) ?? null;
        } else {
          return snapshot.state.find((block) => block.id === id) ?? null;
        }
      },

      ref(id) {
        return blocksRef.current.get(id) ?? null;
      },

      update(block, options) {
        console.info("update", { block, options });

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
        console.info("remove", { block, options });

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
        console.info("split", { right, left, options });

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
        const flushed =
          !!editorRef.current &&
          bus.dispatchTypedEvent(
            "flush",
            new EditorEvent("flush", editorRef.current),
          );

        console.info("flush", { flushed });

        return flushed;
      },

      commit() {
        const snapshot = history.snapshot();

        console.info("commit", { snapshot });

        editorRef.current?.flush();
        setSnapshot(snapshot);
      },
    }),
    [snapshot, bus, history],
  );
  editorRef.current = editor;

  const isInitialRef = useRef(true);

  // Set `selectionAfter` of last action after commit
  useEffect(() => {
    if (isInitialRef.current) return;

    bus.dispatchTypedEvent("commit", new EditorEvent("commit", editor));

    const { selectionAfter } = history.action ?? {};
    const element = selectionAfter && editor.ref(selectionAfter.id);
    const currentSelection = element && getSelectionRange(element);
    const selectionEquals =
      selectionAfter &&
      currentSelection &&
      selectionAfter.start === currentSelection.start &&
      selectionAfter.end === currentSelection.end;

    if (selectionAfter && element && !selectionEquals) {
      setSelectionRange(element, selectionAfter);
    }
  }, [snapshot]);

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

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

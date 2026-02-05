import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { TypedEventTarget } from "typescript-event-target";
import { History } from "../../../utils/history.js";
import {
  getSelectionRange,
  mergeSelections,
  Selection,
} from "../../../utils/selection.js";

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
  update(block: Block): void;
  /** Remove a block by ID. Pushes to history. */
  remove(block: Block): void;
  /** Replace block `left` with `[left, right]`. Pushes to history. */
  split(left: Block, right: Block): void;
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

  function getFocusedBlock() {
    const active = document.activeElement;
    if (!active) return null;
    for (const [id, element] of blocksRef.current) {
      if (element?.contains(active)) {
        return { id, element, block: snapshot.state.find((b) => b.id === id) };
      }
    }
    return null;
  }

  function getCurrentSelection(): BlockSelection | null {
    const focused = getFocusedBlock();
    if (!focused?.element) return null;
    const selection = getSelectionRange(focused.element);
    if (!selection) return null;
    return { id: focused.id, ...selection };
  }

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

      update(block) {
        const selection = getCurrentSelection();
        if (!selection) return;
        const cmd: EditorCommand = { type: "update", block, selection };
        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      remove(block) {
        const selection = getCurrentSelection();
        if (!selection) return;
        const cmd: EditorCommand = { type: "remove", block, selection };
        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      split(left, right) {
        const selection = getCurrentSelection();
        if (!selection) return;
        const cmd: EditorCommand = { type: "split", left, right, selection };
        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      transaction(fn) {
        txRef.current = [];
        fn();
        const commands = txRef.current;
        txRef.current = null;
        if (commands.length > 0) {
          history.push({
            type: "apply",
            commands,
            selection: {
              id: commands[0].selection.id,
              ...mergeSelections(
                commands[0].selection,
                ...commands.slice(1).map((cmd) => cmd.selection),
              ),
            },
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
  | { type: "update"; block: Block; selection: BlockSelection }
  | { type: "remove"; block: Pick<Block, "id">; selection: BlockSelection }
  | {
      type: "split";
      left: Block;
      right: Block;
      selection: BlockSelection;
    }
  | { type: "apply"; commands: EditorCommand[]; selection: BlockSelection };

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

import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isNonEmpty } from "@notion-site/common/utils/non-empty.js";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Selection } from "../../../utils/selection.js";
import { EditorEvent, EditorEventTarget } from "./event.js";
import { EditorCommand, EditorHistory } from "./history.js";

/**
 * Optional selection overrides for editor commands.
 * If not provided, defaults to current DOM selection.
 */
export type SelectionOptions = {
  /** Selection before the change (for undo). */
  selectionBefore?: Selection;
  /** Selection after the change (for redo). */
  selectionAfter?: Selection;
};

/**
 * Shared state passed to plugins in their editor setup phase.
 *
 * @typeParam TEventMap - Map of event type names to Event classes. Defaults to
 * `Record<string, never>` which errors if you try to use events without typing.
 */
export type ContentEditor = {
  /** Current snapshot of the state */
  blocks: zNotion.blocks.block[];
  /** Changes every time that the snapshot is updated (so react is going to update) */
  revision: number;
  /** Block ID → DOM element. Populated by plugins via the `ref` prop. */
  blocksRef: RefObject<Map<string, HTMLElement | null>>;
  /** Event target for editor commands. */
  bus: EditorEventTarget;
  /** Command history for undo/redo. */
  history: EditorHistory;
  /**
   * True if the current snapshot is stale.
   * Need to flush before making changes if you're reading from blocks.
   */
  isDirty: boolean;

  // Helpers to read blocks from state

  /** Returns block data from the current snapshot by id. */
  get(id: string): zNotion.blocks.block | null;
  /** Flushes pending changes if needed, then returns block data from the latest history state. */
  peek(id: string): zNotion.blocks.block | null;
  /** Returns block's registered DOM element by id. */
  ref(id: string): HTMLElement | null;

  // Methods to update the state

  /** Replace a block by ID. Pushes to history. */
  update(block: zNotion.blocks.block, options?: SelectionOptions): void;
  /** Remove a block by ID. Pushes to history. */
  remove(block: zNotion.blocks.block, options?: SelectionOptions): void;
  /** Replace block `left` with `[left, right]`. Pushes to history. */
  split(
    left: zNotion.blocks.block,
    right: zNotion.blocks.block,
    options?: SelectionOptions,
  ): void;
  /** Batch multiple operations as a single history entry. */
  transaction(fn: () => void): void;
  /**
   * Notify plugins to commit pending changes, returning true if the event was handled.
   * @return false is the event default was prevented.
   */
  flush(): boolean;
  /** Commit the current state of history to DOM. Callback runs after render is done. */
  commit(): void;
};

/**
 * Creates shared state & controller for the editor plugins.
 *
 * @typeParam TEventMap - Map of event types. Must be explicitly provided when
 * using plugins that emit events.
 */
export function useContentEditor({
  initialValue,
}: {
  initialValue: zNotion.blocks.block[];
}): ContentEditor {
  const bus = useMemo(() => new EditorEventTarget(), []);
  const history = useMemo(() => new EditorHistory(initialValue), []);
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
        if (!editorRef.current) return;

        const cmd: EditorCommand = {
          type: "update",
          block,
          selectionBefore: options?.selectionBefore,
          selectionAfter: options?.selectionAfter,
        };

        const event = new EditorEvent("edit", editorRef.current, cmd);
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      remove(block, options) {
        if (!editorRef.current) return;

        const cmd: EditorCommand = {
          type: "remove",
          block,
          selectionBefore: options?.selectionBefore,
          selectionAfter: options?.selectionAfter,
        };

        const event = new EditorEvent("edit", editorRef.current, cmd);
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      split(left, right, options) {
        if (!editorRef.current) return;

        const cmd: EditorCommand = {
          type: "split",
          left,
          right,
          selectionBefore: options?.selectionBefore,
          selectionAfter: options?.selectionAfter,
        };

        const event = new EditorEvent("edit", editorRef.current, cmd);
        bus.dispatchTypedEvent("edit", event);
        if (event.defaultPrevented) return;

        if (txRef.current) txRef.current.push(cmd);
        else history.push(cmd);
      },

      transaction(fn) {
        txRef.current ??= [];
        fn();
        const commands = txRef.current;
        txRef.current = null;

        if (!isNonEmpty(commands)) return;

        const cmd = {
          type: "apply",
          commands: EditorCommand.flat(commands),
          selectionBefore: commands.find((cmd) => cmd.selectionBefore)
            ?.selectionBefore,
          selectionAfter: [...commands]
            .reverse()
            .find((cmd) => cmd.selectionAfter)?.selectionAfter,
        } as const;

        history.push(cmd);
      },

      flush() {
        if (!editorRef.current) return false;

        const event = new EditorEvent("flush", editorRef.current, {});
        bus.dispatchTypedEvent("flush", event);

        return !event.defaultPrevented;
      },

      commit() {
        if (!editorRef.current) return;
        const snapshot = history.snapshot();

        const event = new EditorEvent(
          "commit",
          editorRef.current,
          snapshot.state,
        );
        bus.dispatchTypedEvent("commit", event);
        if (event.defaultPrevented) return;

        editorRef.current.flush();
        setSnapshot(snapshot);
      },
    }),
    [snapshot, bus, history],
  );
  editorRef.current = editor;

  const isInitialRef = useRef(true);

  useEffect(() => {
    const cmd = history.command;
    const event = !cmd
      ? new EditorEvent("reset", editor, {})
      : new EditorEvent("push", editor, {});
    bus.dispatchTypedEvent(event.eventType, event);
  }, [snapshot]);

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  return editor;
}

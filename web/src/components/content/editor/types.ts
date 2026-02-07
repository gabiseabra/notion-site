import type { RefObject } from "react";
import type { Selection } from "../../../utils/selection.js";
import type { EditorEventTarget } from "./event.js";
import type { EditorHistory } from "./history.js";

export type AnyBlock = { id: string };

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
 */
export type ContentEditor<TBlock extends AnyBlock> = {
  /** Current snapshot of the state */
  blocks: TBlock[];
  /** Changes every time that the snapshot is updated (so react is going to update) */
  revision: number;
  /** Block ID → DOM element. Populated by plugins via the `ref` prop. */
  blocksRef: RefObject<Map<string, HTMLElement | null>>;
  /** Event target for editor commands. */
  bus: EditorEventTarget<TBlock>;
  /** Command history for undo/redo. */
  history: EditorHistory<TBlock>;
  /**
   * True if the current snapshot is stale.
   * Need to flush before making changes if you're reading from blocks.
   */
  isDirty: boolean;

  // Helpers to read blocks from state

  /** Returns block data from the current snapshot by id. */
  get(id: string): TBlock | null;
  /** Flushes pending changes if needed, then returns block data from the latest history state. */
  peek(id: string): TBlock | null;
  /** Returns block's registered DOM element by id. */
  ref(id: string): HTMLElement | null;

  // Methods to update the state

  /** Replace a block by ID. Pushes to history. */
  update(block: TBlock, options?: SelectionOptions): void;
  /** Remove a block by ID. Pushes to history. */
  remove(block: TBlock, options?: SelectionOptions): void;
  /** Replace block `left` with `[left, right]`. Pushes to history. */
  split(left: TBlock, right: TBlock, options?: SelectionOptions): void;
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

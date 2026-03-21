import { SelectionRange } from "../../../utils/selection-range.js";
import type { EditorEventTarget } from "./editor-event.js";
import { EditorActionCmd, EditorHistory } from "./editor-history.js";

export type ID = string | number | symbol;

export type AnyBlock = { id: ID };

/**
 * Optional selection overrides for editor commands.
 * If not provided, defaults to current DOM selection.
 */
export type ActionOptions = {
  data?: unknown;
  /** @note undefined id flushes everything */
  batchId?: ID;
  /** Selection before the change (for undo). */
  selectionBefore?: SelectionRange;
  /** Selection after the change (for redo). */
  selectionAfter?: SelectionRange;
};

export type EditorBatch<TBlock extends AnyBlock> = {
  batchId: ID;
  commands: EditorActionCmd<TBlock>[];
};

/**
 * Shared state passed to plugins in their editor setup phase.
 */
export type ContentEditor<TBlock extends AnyBlock> = {
  /**
   * Last committed state. Updated after `commit()`.
   * May be stale if edits were made since last commit — check `isDirty`.
   */
  blocks: TBlock[];
  /**
   * History position at the time of last commit.
   * Increases with each edit, decreases on undo.
   */
  revision: number;

  /**
   * Manages state of uncommitted changes.
   * Manipulating history directly e.g. by calling `editor.history.undo` / `redo` ,
   * does not flush pending changes, so if you have any, they will be overwritten.
   * Make sure to flush by calling `peek` before doing it.
   */
  history: EditorHistory<TBlock>;
  /**
   * Emits lifecycle events.
   * Plugins subscribe here to intercept or react to editor changes.
   */
  bus: EditorEventTarget<TBlock>;

  // Batch stuff

  /**
   * If the editor is in batch, save pending changes to history and end the
   * batch.
   * @returns true if there was an effect.
   */
  flush(data?: unknown): boolean;

  inBatch(exceptId?: ID): boolean;

  // Methods to read from state

  /**
   * If the editor is batching, get the latest data by block id and don't
   * commit. Otherwise returns the comitted data for the block id.
   */
  peek(id: TBlock["id"]): TBlock | null;

  /**
   * Get the DOM element registered for a block. Returns `null` if the block
   * hasn't mounted yet or was removed.
   */
  ref(id: TBlock["id"]): HTMLElement | null;

  // Methods to update the state

  /**
   * Replace a block's data. Dispatches an `edit` event (can be cancelled).
   */
  update(block: TBlock, options?: ActionOptions): void;

  /**
   * Remove a block from state. Dispatches an `edit` event (can be cancelled).
   */
  remove(block: TBlock, options?: ActionOptions): void;

  /**
   * Update the block on the left and insert the block on the right next to it.
   * Dispatches an `edit` event (can be cancelled).
   */
  split(left: TBlock, right: TBlock, options?: ActionOptions): void;

  /**
   * Sync React state with history.
   */
  commit(data?: unknown): void;
};

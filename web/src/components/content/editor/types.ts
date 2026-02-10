import { SelectionRange } from "../../../utils/selection-range.js";
import type { EditorEventTarget } from "./editor-event.js";
import { EditorHistory } from "./editor-history.js";

export type AnyBlock = { id: string };

/**
 * Optional selection overrides for editor commands.
 * If not provided, defaults to current DOM selection.
 */
export type EditOptions = {
  data?: unknown;
  /** Selection before the change (for undo). */
  selectionBefore?: SelectionRange;
  /** Selection after the change (for redo). */
  selectionAfter?: SelectionRange;
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
   * True when history has moved past the last committed snapshot.
   * When dirty, `blocks` is stale — use `peek()` to read fresh state.
   */
  readonly isDirty: boolean;
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

  // Methods to read from state

  /**
   * Read block by id from the last committed snapshot.
   */
  get(id: string): TBlock | null;

  /**
   * Read block by id from the latest history state after flushing pending changes.
   * More expensive than `get()`, but guarantees fresh data.
   */
  peek(id: string): TBlock | null;

  /**
   * Get the DOM element registered for a block. Returns `null` if the block
   * hasn't mounted yet or was removed.
   */
  ref(id: string): HTMLElement | null;

  // Methods to update the state

  /**
   * Replace a block's data. Dispatches an `edit` event (can be cancelled).
   */
  update(block: TBlock, options?: EditOptions): void;

  /**
   * Remove a block from state. Dispatches an `edit` event (can be cancelled).
   */
  remove(block: TBlock, options?: EditOptions): void;

  /**
   * Update the block on the left and insert the block on the right next to it.
   * Dispatches an `edit` event (can be cancelled).
   */
  split(left: TBlock, right: TBlock, options?: EditOptions): void;

  /**
   * Group multiple edits into one undo/redo step.
   */
  transaction(
    fn: () => void,
    options?: {
      selectionBefore?: SelectionRange & { id: string };
      selectionAfter?: SelectionRange & { id: string };
    },
  ): void;

  /**
   * Sync React state with history.
   */
  commit(data?: unknown): void;
};

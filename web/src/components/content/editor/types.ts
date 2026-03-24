import { IHistory } from "@notion-site/common/utils/history.js";
import type { EditorEventTarget } from "./editor-event.js";
import { EditorAction } from "./editor-history.js";

export type ID = string | number | symbol;

export type AnyBlock = { id: ID };

/**
 * Shared state passed to plugins in their editor setup phase.
 */
export interface ContentEditor<TBlock extends AnyBlock> {
  /**
   * Last committed state. Updated after `commit()`.
   * May be stale if history has advanced since the last commit.
   */
  readonly blocks: TBlock[];
  /**
   * History position at the time of last commit.
   * Increases with each edit, decreases on undo.
   */
  readonly revision: number;

  /**
   * Manages undo/redo state.
   * Manipulating history directly e.g. by calling `editor.history.undo` / `redo`
   * does not flush changesets, so any pending changeset actions will be overwritten.
   * Call `peek` first to trigger a flush before manipulating history.
   */
  readonly history: IHistory<EditorAction<TBlock>, TBlock[]>;

  /**
   * Emits lifecycle events.
   * Plugins subscribe here to intercept or react to editor changes.
   */
  readonly bus: EditorEventTarget<TBlock>;

  // Methods to read from state

  /**
   * Get the DOM element registered for a block. Returns `null` if the block
   * hasn't mounted yet or was removed.
   */
  ref(id: TBlock["id"]): HTMLElement | null;

  /**
   * Notifies other plugins to flush pending changes immediatelly! ! !
   */
  flush(data?: unknown): void;

  /**
   * Returns the latest history state for the given block id.
   * Use instead of `blocks` when you need up-to-date state mid-edit.
   */
  peek(id: TBlock["id"]): TBlock | null;

  /**
   * Push action to history. Records a undo/redo-able event.
   */
  push(action: EditorAction<TBlock>, data?: unknown): void;

  /**
   * Sync React state with history.
   */
  commit(data?: unknown): void;
}

import { EditorAction } from "./editor-history";
import { EditorTarget } from "./editor-target";
import { AnyBlock } from "./types";

/**
 * Represents one layer in a stack of pending edits.
 * Each layer holds changes that have been pushed but not yet flushed downward.
 * The editor itself is the bottom layer.
 * `useContentEditor` implements this on top of history (pending = uncommitted history entries);
 * `useEditorChangeset` implements it on top of the editor (pending = in-memory batch).
 */
export interface EditorChangeset<TBlock extends AnyBlock> {
  /**
   * Latest action that has been pushed but not yet commited.
   * `null` if no changes are pending.
   */
  readonly latest:
    | (EditorAction<TBlock> & {
        targetBefore: EditorTarget<TBlock>;
        targetAfter: EditorTarget<TBlock>;
      })
    | null;

  /**
   * `true` while there are pending actions yet to be committed.
   */
  readonly hasUnsavedChanges: boolean;

  /**
   * Clears the pending batch.
   */
  discard(data?: unknown): void;

  /**
   * Returns the block by id including any pending changes.
   * @note this emits flush internally so other changesets observing the same
   * editor commit their own pending batches first.
   */
  peek(id: TBlock["id"], flushData?: unknown): TBlock | null;

  /**
   * Appends an action to the pending batch.
   * @note `targetBefore` falls back to the `latest.targetAfter`.
   */
  push(
    action: EditorAction<TBlock> & {
      data?: unknown;
      targetBefore?: EditorTarget<TBlock>;
      targetAfter?: EditorTarget<TBlock>;
    },
  ): void;
}

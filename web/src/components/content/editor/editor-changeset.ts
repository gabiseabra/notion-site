import { SelectionRange } from "../../../utils/selection-range";
import { EditorAction } from "./editor-history";
import { AnyBlock } from "./types";

export type EditorChangeset<TBlock extends AnyBlock> = {
  /**
   * Selection before the first action in the pending batch.
   * `null` if empty.
   */
  readonly selectionBefore: SelectionRange | null;
  /**
   * Selection after the last action in the pending batch.
   * `null` if empty.
   */
  readonly selectionAfter: SelectionRange | null;

  readonly hasUnsavedChanges: boolean;

  /**
   * Clears the pending batch.
   */
  discard(data?: unknown): void;

  /**
   * Notifies other plugins to flush pending changes immediatelly! ! !
   */
  flush(data?: unknown): void;

  /**
   * Returns the block by id including any pending changes.
   * @note this calls flush internally.
   */
  peek(id: TBlock["id"], flushData?: unknown): TBlock | null;

  /** Appends an action to the pending batch. `selectionBefore` is inferred from
   * the pending batch's `selectionAfter` or the last committed history action if not
   * already set on the action. */
  push(action: EditorAction<TBlock> & { data?: unknown }): void;
};

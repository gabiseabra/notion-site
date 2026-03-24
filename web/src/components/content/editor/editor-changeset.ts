import { SelectionRange } from "../../../utils/selection-range";
import { EditorAction, EditorActionCmd } from "./editor-history";
import { AnyBlock } from "./types";

export type EditorChangeset<TBlock extends AnyBlock> = {
  /** Selection before the first action in the pending batch. `null` if empty. */
  readonly selectionBefore: SelectionRange | null;
  /** Selection after the last action in the pending batch. `null` if empty. */
  readonly selectionAfter: SelectionRange | null;

  /** Returns the pending batch as an `apply` action, or `null` if empty.
   * Does not clear the batch. */
  extract(): EditorAction<TBlock> | null;

  /** Clears the pending batch without committing it to history. */
  discard(): void;

  /** Commits the pending batch to history. */
  flush(data?: unknown): void;

  /** Returns the block including any pending changes. */
  peek(id: TBlock["id"]): TBlock | null;

  /** Appends an action to the pending batch. `selectionBefore` is inferred from
   * the pending batch's `selectionAfter` or the last committed history action if not
   * already set on the action. */
  push(action: EditorActionCmd<TBlock>): void;
};

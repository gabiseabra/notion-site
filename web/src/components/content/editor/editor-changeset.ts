import { EditorAction } from "./editor-history";
import { EditorTarget } from "./editor-target";
import { AnyBlock } from "./types";

export type EditorChangeset<TBlock extends AnyBlock> = {
  readonly latest:
    | (EditorAction<TBlock> & {
        targetBefore: EditorTarget<TBlock>;
        targetAfter: EditorTarget<TBlock>;
      })
    | null;

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

  /** Appends an action to the pending batch. `targetBefore` is inferred from
   * the pending batch's `targetAfter` or the last committed history action if not
   * already set on the action. */
  push(
    action: EditorAction<TBlock> & {
      data?: unknown;
      targetBefore?: EditorTarget<TBlock>;
      targetAfter?: EditorTarget<TBlock>;
    },
  ): void;
};

import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { ReadOnlyHistory } from "@notion-site/common/utils/history.js";
import { EditorChangeset } from "./editor-changeset";
import { EditorCommand } from "./editor-command";
import type { EditorEventTarget } from "./editor-event.js";
import { EditorAction } from "./editor-history.js";

export type ID = string | number | symbol;

export type AnyBlock = { id: ID };

export type BlockRef = {
  element: HTMLElement | null;
  children: Map<ID, HTMLElement>;
};

export const BlockRef = {
  flat(ref: BlockRef): HTMLElement[] {
    return [
      ref.element,
      ...Array.from(ref.children.entries()).flatMap(([, element]) => element),
    ].filter(isNonNullable);
  },
};

/**
 * Shared state passed to plugins in their editor setup phase.
 */
export interface ContentEditor<
  TBlock extends AnyBlock,
> extends EditorChangeset<TBlock> {
  readonly id: string;

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
   * @note Manipulating history directly e.g. by calling `editor.history.undo` / `redo`
   * does not flush changesets, so any pending changeset actions will be overwritten.
   * Call `peek` first to trigger a flush before manipulating history.
   */
  readonly history: ReadOnlyHistory<EditorAction<TBlock>, TBlock[]> & {
    undo(dryRun?: boolean): boolean;
    redo(dryRun?: boolean): boolean;
  };

  /**
   * Emits lifecycle events.
   * Plugins subscribe here to intercept or react to editor changes.
   */
  readonly bus: EditorEventTarget<TBlock>;

  /**
   * Get the DOM element registered for a block. Returns `null` if the block
   * hasn't mounted yet or was removed.
   */
  ref(
    id: TBlock["id"],
    childId?: ID,
  ): BlockRef & {
    (element: HTMLElement | null): void;
  };

  /**
   * Runs a command against a block. If `id` is given, targets that block;
   * otherwise targets the currently focused block.
   */
  exec(cmd: EditorCommand<TBlock>, id?: TBlock["id"]): void;

  /**
   * Finalizes the pending changeset by saving the latest changes to the state.
   * Lives on the editor rather than the changeset because it owns the state.
   */
  commit(data?: unknown): void;
}

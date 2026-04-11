import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { History } from "@notion-site/common/utils/history.js";
import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { EditorTarget } from "./editor-target";
import { AnyBlock } from "./types.js";

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorActionCmd<TBlock extends AnyBlock> =
  | { type: "update"; block: TBlock }
  | { type: "remove"; block: TBlock }
  | { type: "split"; left: TBlock; right: TBlock };

interface EditorActionBatch<TBlock extends AnyBlock> {
  type: "apply";
  actions: NonEmpty<EditorActionCmd<TBlock>>;
}

export type EditorAction<TBlock extends AnyBlock> =
  | EditorActionBatch<TBlock>
  | EditorActionCmd<TBlock>;

export const EditorAction = {
  flat,

  map<A extends AnyBlock, B extends AnyBlock>(
    action: EditorAction<A>,
    f: (s: A) => B,
  ): EditorAction<B> | undefined {
    switch (action.type) {
      case "apply": {
        const actions = action.actions
          .flatMap((cmd) => {
            const b = EditorAction.map(cmd, f);
            return typeof b === "undefined" ? [] : EditorAction.flat([b]);
          })
          .filter(isNonNullable);

        return NonEmpty.isNonEmpty(actions)
          ? { ...action, actions }
          : undefined;
      }
      case "split": {
        const left = f(action.left);
        const right = f(action.right);
        return left && right ? { ...action, left, right } : undefined;
      }
      default: {
        const block = f(action.block);
        return block ? { ...action, block } : undefined;
      }
    }
  },

  apply<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
    blocks: TBlock[],
  ): TBlock[] {
    switch (cmd.type) {
      // case "focus":
      //   return blocks;
      case "update":
        return blocks.map((b) => (b.id === cmd.block.id ? cmd.block : b));
      case "remove":
        return blocks.filter((b) => b.id !== cmd.block.id);
      case "split": {
        const index = blocks.findIndex((b) => b.id === cmd.left.id);
        if (index === -1) return blocks;
        const result = [...blocks];
        result.splice(index, 1, cmd.left, cmd.right);
        return result;
      }
      case "apply":
        return cmd.actions.reduce(
          (acc, cmd) => EditorAction.apply(cmd, acc),
          blocks,
        );
    }
  },

  applyCmd<TBlock extends AnyBlock>(
    actions: EditorActionCmd<TBlock>[],
    blocks: TBlock[],
  ) {
    if (!NonEmpty.isNonEmpty(actions)) return blocks;
    return EditorAction.apply({ type: "apply", actions }, blocks);
  },
};

function flat<TBlock extends AnyBlock>(
  allCmds: NonEmpty<EditorAction<TBlock>>,
): NonEmpty<EditorActionCmd<TBlock>>;
function flat<TBlock extends AnyBlock>(
  allCmds: EditorAction<TBlock>[],
): EditorActionCmd<TBlock>[] {
  if (!NonEmpty.isNonEmpty(allCmds)) return [];
  const [cmd, ...cmds] = allCmds;
  return [
    ...(cmd.type === "apply" ? cmd.actions : [cmd]),
    ...(NonEmpty.isNonEmpty(cmds) ? EditorAction.flat(cmds) : []),
  ];
}

export type EditorHistoryEntry<TBlock extends AnyBlock> =
  EditorAction<TBlock> & {
    targetAfter: EditorTarget<TBlock>;
    targetBefore: EditorTarget<TBlock>;
  };

export class EditorHistory<TBlock extends AnyBlock> extends History<
  EditorHistoryEntry<TBlock>,
  TBlock[]
> {
  constructor(initialValue: TBlock[]) {
    super(initialValue, (blocks, cmd) => EditorAction.apply(cmd, blocks));
  }
}

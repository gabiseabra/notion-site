import {
  hasNonNullableProperty,
  isNonNullable,
} from "@notion-site/common/utils/guards.js";
import { History } from "@notion-site/common/utils/history.js";
import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, ID } from "./types.js";

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorActionCmd<TBlock extends AnyBlock> =
  | {
      type: "update";
      block: TBlock;
      childId?: ID;
      selectionBefore?: SelectionRange;
      selectionAfter?: SelectionRange;
    }
  | {
      type: "remove";
      block: TBlock;
      selectionBefore?: SelectionRange;
      selectionAfter?: SelectionRange;
    }
  | {
      type: "split";
      left: TBlock;
      right: TBlock;
      selectionBefore?: SelectionRange;
      selectionAfter?: SelectionRange;
    };

interface EditorActionBatch<TBlock extends AnyBlock> {
  type: "apply";
  actions: NonEmpty<EditorActionCmd<TBlock>>;
}

export type EditorAction<TBlock extends AnyBlock> =
  | EditorActionBatch<TBlock>
  | EditorActionCmd<TBlock>
  | {
      type: "focus";
      block: { id: TBlock["id"] };
      childId?: ID;
      selectionBefore?: SelectionRange;
      selectionAfter?: SelectionRange;
    };

export const EditorAction = {
  flat<TBlock extends AnyBlock>([cmd, ...cmds]: NonEmpty<
    EditorAction<TBlock>
  >): EditorActionCmd<TBlock>[] {
    return [
      ...(cmd.type === "apply"
        ? EditorAction.flat(cmd.actions)
        : cmd.type === "focus"
          ? []
          : [cmd]),
      ...(NonEmpty.isNonEmpty(cmds) ? EditorAction.flat(cmds) : []),
    ];
  },

  targetBefore<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
  ): { id: TBlock["id"]; childId?: ID } {
    switch (cmd.type) {
      case "apply":
        return EditorAction.targetBefore(
          cmd.actions.find(hasNonNullableProperty("selectionBefore")) ??
            cmd.actions[0],
        );
      case "split":
        return { id: cmd.left.id };
      case "update":
      case "focus":
        return { id: cmd.block.id, childId: cmd.childId };
      default:
        return { id: cmd.block.id };
    }
  },

  targetAfter<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
  ): { id: TBlock["id"]; childId?: ID } {
    switch (cmd.type) {
      case "apply":
        return EditorAction.targetBefore(
          [...cmd.actions]
            .reverse()
            .find(hasNonNullableProperty("selectionAfter")) ??
            cmd.actions[cmd.actions.length - 1],
        );
      case "split":
        return { id: cmd.right.id };
      case "update":
      case "focus":
        return { id: cmd.block.id, childId: cmd.childId };
      default:
        return { id: cmd.block.id };
    }
  },

  selectionBefore<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
  ): SelectionRange | undefined {
    if (cmd.type !== "apply") return cmd.selectionBefore;
    return cmd.actions.filter(hasNonNullableProperty("selectionBefore"))[0]
      ?.selectionBefore;
  },

  selectionAfter<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
  ): SelectionRange | undefined {
    if (cmd.type !== "apply") return cmd.selectionAfter;
    return cmd.actions.filter(hasNonNullableProperty("selectionAfter")).pop()
      ?.selectionAfter;
  },

  preview<A extends AnyBlock, B extends AnyBlock>(
    action: EditorAction<A>,
    prism: { get: (s: A) => B | undefined },
  ): EditorAction<B> | undefined {
    switch (action.type) {
      case "focus":
        return action;
      case "apply": {
        const actions = action.actions
          .flatMap((cmd) => {
            const b = EditorAction.preview(cmd, prism);
            return typeof b === "undefined" ? [] : EditorAction.flat([b]);
          })
          .filter(isNonNullable);

        return NonEmpty.isNonEmpty(actions)
          ? { ...action, actions }
          : undefined;
      }
      case "split": {
        const left = prism.get(action.left);
        const right = prism.get(action.right);
        return left && right ? { ...action, left, right } : undefined;
      }
      default: {
        const block = prism.get(action.block);
        return block ? { ...action, block } : undefined;
      }
    }
  },
};

export class EditorHistory<TBlock extends AnyBlock> extends History<
  EditorAction<TBlock>,
  TBlock[]
> {
  constructor(initialValue: TBlock[]) {
    super(initialValue, (blocks, cmd) => applyAction(blocks, cmd));
  }
}

function applyAction<TBlock extends AnyBlock>(
  blocks: TBlock[],
  cmd: EditorAction<TBlock>,
): TBlock[] {
  switch (cmd.type) {
    case "focus":
      return blocks;
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
      return cmd.actions.reduce(applyAction, blocks);
  }
}

export function applyActions<TBlock extends AnyBlock>(
  blocks: TBlock[],
  ...commands: EditorActionCmd<TBlock>[]
) {
  if (!NonEmpty.isNonEmpty(commands)) return blocks;
  return applyAction(blocks, { type: "apply", actions: commands });
}

import { hasNonNullableProperty } from "@notion-site/common/utils/guards.js";
import { History } from "@notion-site/common/utils/history.js";
import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { match } from "ts-pattern";
import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock } from "./types.js";

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorActionCmd<TBlock extends AnyBlock> =
  | {
      type: "update";
      block: TBlock;
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

export type EditorAction<TBlock extends AnyBlock> =
  | {
      type: "apply";
      commands: NonEmpty<EditorActionCmd<TBlock>>;
    }
  | EditorActionCmd<TBlock>;

export const EditorAction = {
  /**
   * Get the target block id of the selection going in the given direction
   * @note selection will be restored on history events in the following order:
   * - undo: first non-empty { selectionBefore, block: { id } }
   * - redo: last non-empty { selectionAfter, block: { id } }
   */
  id<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
    direction: 1 | -1,
  ): TBlock["id"] {
    return match(cmd)
      .with({ type: "apply" }, (cmd) =>
        EditorAction.id(
          direction === 1
            ? cmd.commands[cmd.commands.length - 1]
            : cmd.commands[0],
          direction,
        ),
      )
      .with(
        { type: "split" },
        (cmd) => cmd[direction === -1 ? "left" : "right"].id,
      )
      .otherwise((cmd) => cmd.block.id);
  },

  flat<TBlock extends AnyBlock>([cmd, ...cmds]: NonEmpty<
    EditorAction<TBlock>
  >): NonEmpty<EditorActionCmd<TBlock>> {
    return NonEmpty.merge(
      cmd.type === "apply" ? EditorAction.flat(cmd.commands) : ([cmd] as const),
      NonEmpty.isNonEmpty(cmds) ? EditorAction.flat(cmds) : [],
    );
  },

  selection<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
    direction: 1 | -1,
  ): SelectionRange | undefined {
    if (direction === -1) {
      if (cmd.type !== "apply") return cmd.selectionBefore;
      return cmd.commands.filter(hasNonNullableProperty("selectionBefore"))[0]
        ?.selectionBefore;
    } else {
      if (cmd.type !== "apply") return cmd.selectionAfter;
      return cmd.commands.filter(hasNonNullableProperty("selectionAfter")).pop()
        ?.selectionAfter;
    }
  },
};

export class EditorHistory<TBlock extends AnyBlock> extends History<
  TBlock[],
  EditorAction<TBlock>
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
      return cmd.commands.reduce(applyAction, blocks);
  }
}

export function applyActions<TBlock extends AnyBlock>(
  blocks: TBlock[],
  ...commands: EditorActionCmd<TBlock>[]
) {
  if (!NonEmpty.isNonEmpty(commands)) return blocks;
  return applyAction(blocks, { type: "apply", commands });
}

import { History } from "@notion-site/common/utils/history.js";
import { match } from "ts-pattern";
import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock } from "./types.js";

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorCommandCmd<TBlock extends AnyBlock> =
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

export type EditorCommand<TBlock extends AnyBlock> =
  | {
      type: "apply";
      commands: EditorCommandCmd<TBlock>[];
      selectionBefore?: SelectionRange;
      selectionAfter?: SelectionRange;
    }
  | EditorCommandCmd<TBlock>;

export const EditorCommand = {
  /**
   * Get the target block id of the selection going in the given direction
   * @note selection will be restored on history events in the following order:
   * - undo: first non-empty { selectionBefore, block: { id } }
   * - redo: last non-empty { selectionAfter, block: { id } }
   */
  id<TBlock extends { id: string }>(
    cmd: EditorCommand<TBlock>,
    direction: "undo" | "redo",
  ): string {
    return match(cmd)
      .with({ type: "apply" }, (cmd) =>
        direction === "undo"
          ? EditorCommand.id(cmd.commands[0], direction)
          : EditorCommand.id(cmd.commands[cmd.commands.length - 1], direction),
      )
      .with(
        { type: "split" },
        (cmd) =>
          cmd[
            (
              {
                redo: "right",
                undo: "left",
              } as const
            )[direction]
          ].id,
      )
      .otherwise((cmd) => cmd.block.id);
  },

  flat<TBlock extends { id: string }>(
    cmds: EditorCommand<TBlock>[],
  ): EditorCommandCmd<TBlock>[] {
    return cmds.flatMap((cmd) => (cmd.type === "apply" ? cmd.commands : [cmd]));
  },
};

export class EditorHistory<TBlock extends { id: string }> extends History<
  TBlock[],
  EditorCommand<TBlock>
> {
  constructor(initialValue: TBlock[]) {
    super(initialValue, (blocks, cmd) => applyCommand(blocks, cmd));
  }
}

function applyCommand<TBlock extends { id: string }>(
  blocks: TBlock[],
  cmd: EditorCommand<TBlock>,
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
      return cmd.commands.reduce(applyCommand, blocks);
  }
}

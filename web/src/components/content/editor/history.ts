import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { History } from "@notion-site/common/utils/history.js";
import { match } from "ts-pattern";
import { Selection } from "../../../utils/selection.js";

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorCommandCmd =
  | {
      type: "update";
      block: zNotion.blocks.block;
      selectionBefore?: Selection;
      selectionAfter?: Selection;
    }
  | {
      type: "remove";
      block: Pick<zNotion.blocks.block, "id">;
      selectionBefore?: Selection;
      selectionAfter?: Selection;
    }
  | {
      type: "split";
      left: zNotion.blocks.block;
      right: zNotion.blocks.block;
      selectionBefore?: Selection;
      selectionAfter?: Selection;
    };

export type EditorCommand =
  | {
      type: "apply";
      commands: EditorCommandCmd[];
      selectionBefore?: Selection;
      selectionAfter?: Selection;
    }
  | EditorCommandCmd;

export const EditorCommand = {
  /**
   * Get the target block id of the selection going in the given direction
   * @note selection will be restored on history events in the following order:
   * - undo: first non-empty { selectionBefore, block: { id } }
   * - redo: last non-empty { selectionAfter, block: { id } }
   */
  id(cmd: EditorCommand, direction: "undo" | "redo"): string {
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

  flat(cmds: EditorCommand[]): EditorCommandCmd[] {
    return cmds.flatMap((cmd) => (cmd.type === "apply" ? cmd.commands : [cmd]));
  },
};

export class EditorHistory extends History<
  zNotion.blocks.block[],
  EditorCommand
> {
  constructor(initialValue: zNotion.blocks.block[]) {
    super(initialValue, applyCommand);
  }
}

function applyCommand(
  blocks: zNotion.blocks.block[],
  cmd: EditorCommand,
): zNotion.blocks.block[] {
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

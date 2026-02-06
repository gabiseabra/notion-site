import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { History } from "@notion-site/common/utils/history.js";
import { Selection } from "../../../utils/selection.js";

export type BlockSelection = { id: string } & Selection;

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorCommand =
  | {
      type: "update";
      block: zNotion.blocks.block;
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    }
  | {
      type: "remove";
      block: Pick<zNotion.blocks.block, "id">;
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    }
  | {
      type: "split";
      left: zNotion.blocks.block;
      right: zNotion.blocks.block;
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    }
  | {
      type: "apply";
      commands: EditorCommand[];
      selectionBefore?: BlockSelection;
      selectionAfter?: BlockSelection;
    };

export class EditorHistory extends History<
  zNotion.blocks.block[],
  EditorCommand
> {
  constructor(initialValue: zNotion.blocks.block[]) {
    super(initialValue, EditorHistory.applyCommand);
  }

  /**
   * Applies a command to the blocks state.
   */
  static applyCommand(
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
        return cmd.commands.reduce(EditorHistory.applyCommand, blocks);
    }
  }
}

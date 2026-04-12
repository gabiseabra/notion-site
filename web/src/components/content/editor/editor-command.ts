import { Slot } from "../../../utils/slot";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor, ID } from "./types.js";

/**
 * Operation run against a target block. Either return a replacement block, in
 * which case the runner pushes an "update" and commits, or drive editor
 * imperatively for non-update actions and return nothing.
 * data is a caller-supplied payload whose meaning is agreed between the command
 * and whoever invokes it.
 */
export type EditorCommand<
  TBlock extends AnyBlock,
  TData = EditorTarget<TBlock> | null,
> = (ctx: {
  block: TBlock;
  data: TData;
  editor: ContentEditor<TBlock>;
}) => TBlock | undefined | void;

/**
 * Caller-side shape of a bound command runner, matching ContentEditor.exec.
 * Invokes an EditorCommand against the editor's current target.
 */
export type ExecCommand<
  TBlock extends AnyBlock,
  TData = EditorTarget<TBlock>,
> = (command: EditorCommand<TBlock, TData>) => void;

/**
 * Builds the runner behind ContentEditor.exec.
 * - Binds the editor and a lazy data slot (so the value, typically the DOM
 *   selection, is not read until the command fires).
 * - Optionally overrides the block and childId to target a specific block
 *   instead of the one under the current selection.
 * - Auto-commits an "update" when the command returns a replacement block.
 */
export const execCommand =
  <TBlock extends AnyBlock, TData>(
    editor: ContentEditor<TBlock>,
    data: Slot<TData>,
    block?: TBlock,
    childId?: ID,
  ) =>
  (command: EditorCommand<TBlock, TData>) => {
    const currentTarget = EditorTarget.read(editor) ?? undefined;
    const currentBlock =
      block ?? (currentTarget && editor.peek(currentTarget.id));
    const newBlock =
      currentBlock &&
      command({
        block: currentBlock,
        data: Slot.extract(data, undefined),
        editor,
      });

    const target = block
      ? {
          id: block.id,
          childId,
          start: 0,
          end: 0,
        }
      : currentTarget;

    if (newBlock) {
      editor.push({
        type: "update",
        block: newBlock,
        targetBefore: target,
        targetAfter: target,
      });
      editor.commit();
    }
  };

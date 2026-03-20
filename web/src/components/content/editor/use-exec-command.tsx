import { useCallback, useMemo } from "react";
import { EditorCommand, ExecCommand } from "./editor-command";
import { EditorSelection } from "./editor-selection";
import { AnyBlock, ContentEditor } from "./types";
import { useEditorSelection } from "./use-editor-selection";

function useFallback<T>(value: T | null, fallback: T): T | null {
  return value === null ? null : (value ?? fallback);
}

export function useExecCommand<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
  overrideSelection?: EditorSelection<TBlock> | null,
  overrideBlock?: TBlock | null,
): ExecCommand<TBlock> {
  const selection = useFallback(overrideSelection, useEditorSelection(editor));
  const block =
    useFallback(
      overrideBlock,
      useMemo(
        () =>
          selection
            ? editor.blocks.find((b) => b.id === selection.id)
            : undefined,
        [selection?.id],
      ),
    ) ?? undefined;

  console.log(selection, block);

  return useCallback(
    (command: EditorCommand<TBlock>) =>
      ExecCommand(
        editor,
        selection,
        block,
      )((editor, selection, block) => {
        if (selection) command(editor, selection, block);
      }),
    [editor, selection, block],
  );
}

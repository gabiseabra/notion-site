import { useCallback, useMemo } from "react";
import { EditorCommand, ExecCommand } from "./editor-command";
import { EditorTarget } from "./editor-target";
import { AnyBlock, ContentEditor } from "./types";
import { useEditorTarget } from "./use-editor-target";

function useFallback<T>(value: T | null, fallback: T): T | null {
  return value === null ? null : (value ?? fallback);
}

export function useExecCommand<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
  overrideSelection?: EditorTarget<TBlock> | null,
  overrideBlock?: TBlock | null,
): ExecCommand<TBlock> {
  const selection = useFallback(overrideSelection, useEditorTarget(editor));
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

  return useCallback(
    (command: EditorCommand<TBlock>) =>
      ExecCommand(
        editor,
        selection,
        block,
      )(({ editor, data, block }) => {
        if (data) command({ editor, data, block });
      }),
    [editor, selection, block],
  );
}

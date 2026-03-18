import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { Editor } from "../../Editor.js";
import { EditorCommand } from "../../editor/editor-command.js";
import { EditorSelection } from "../../editor/editor-selection.js";
import { useEditorSelectionRange } from "../../editor/use-editor-selection-range.js";

export function useToolbarControls(editor: Editor) {
  const selection = useEditorSelectionRange(editor);
  const block =
    selection &&
    (editor.blocks.find(hasPropertyValue("id", selection.id)) ?? null);
  const text = block && Notion.Block.extractRichText(block);

  const disabled = !selection;
  const disabledAction =
    (!selection || SelectionRange.isCollapsed(selection)) && "action";

  return {
    selection,
    block,
    text,
    disabled,
    disabledAction,
    execCommand(
      fn: EditorCommand<Notion.Block, EditorSelection<Notion.Block>>,
    ) {
      const currentBlock = selection && editor.peek(selection.id);
      const newBlock =
        currentBlock && selection && fn(currentBlock, selection, editor);

      if (newBlock) {
        editor.update(newBlock, {
          selectionBefore: selection,
          selectionAfter: selection,
        });
        editor.commit();
      }
    },
  } as const;
}

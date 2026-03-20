import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { Editor } from "../../Editor.js";
import { ExecCommand } from "../../editor/editor-command.js";
import { useEditorSelection } from "../../editor/use-editor-selection.js";

export function useToolbarControls(editor: Editor) {
  const selection = useEditorSelection(editor);
  const block =
    selection &&
    (editor.blocks.find(hasPropertyValue("id", selection.id)) ?? null);
  const text = block && Notion.Block.extractRichText(block);

  const disabled = !selection;
  const disabledAction =
    (!selection ||
      selection.type == "focus" ||
      SelectionRange.isCollapsed(selection)) &&
    "action";

  return {
    selection,
    block,
    text,
    disabled,
    disabledAction,
    execCommand: ExecCommand(editor, selection, block ?? undefined),
  };
}

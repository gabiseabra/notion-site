import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { execCommand } from "../../editable/notion/commands.js";
import { Editor } from "../../Editor.js";
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
    execCommand: execCommand(editor, selection),
  } as const;
}

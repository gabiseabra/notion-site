import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { Editor } from "../../Editor.js";
import { useEditorTarget } from "../../editor/use-editor-target.js";

export function useToolbarControls(editor: Editor) {
  const target = useEditorTarget(editor);
  const block =
    target && (editor.blocks.find(hasPropertyValue("id", target.id)) ?? null);
  const text = block && Notion.Block.extractRichText(block);

  const disabled = !target;
  const readOnly =
    !target || !!target.childId || SelectionRange.isCollapsed(target);

  return {
    selection: target,
    block,
    text,
    disabled,
    readOnly,
  };
}

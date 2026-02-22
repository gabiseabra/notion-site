import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Divider } from "../../display/Divider.js";
import { Row } from "../../layout/FlexBox.js";
import {
  NotionCommand,
  toggleAnnotations,
} from "../editable/notion/command.js";
import { Editor } from "../Editor.js";
import { useEditorSelectionRange } from "../editor/use-editor-selection-range.js";
import { TextColorButton } from "./TextColorButton.js";
import { ToolbarButton } from "./ToolbarButton.js";

export function Toolbar({
  editor,
  disabled,
}: {
  editor: Editor;
  disabled?: boolean;
}) {
  const selection = useEditorSelectionRange(editor);
  const selectedBlock = selection && editor.get(selection.id);

  disabled ??= !selection;
  const disabledAction =
    (!selection || SelectionRange.isCollapsed(selection)) && "action";

  function execCommand(
    fn: (block: Notion.Block, selection: SelectionRange) => Notion.Block | null,
  ) {
    const block = selectedBlock && selection && fn(selectedBlock, selection);

    if (block) {
      editor.update(block, {
        selectionBefore: selection,
        selectionAfter: selection,
      });
      editor.commit();
    }
  }

  return (
    <Row gap={0} alignX="start">
      {(["bold", "italic", "underline", "striketrough"] as const)
        .map((cmd) => [cmd, NotionCommand[cmd]] as const)
        .map(([key, cmd]) => (
          <ToolbarButton
            key={key}
            disabled={disabled || disabledAction}
            active={
              !!selectedBlock &&
              selection &&
              cmd.isActive(selectedBlock, selection)
            }
            title={cmd.key}
            onClick={() => execCommand(cmd.command)}
          >
            {cmd.icon}
          </ToolbarButton>
        ))}

      <Divider direction="y" />

      <TextColorButton
        disabled={disabled || disabledAction}
        value={
          (selectedBlock &&
            selection &&
            Notion.Block.getAnnotations(
              selectedBlock,
              selection.start,
              selection.end,
            ).color) ??
          undefined
        }
        onChange={(color) => execCommand(toggleAnnotations({ color }))}
      />
    </Row>
  );
}

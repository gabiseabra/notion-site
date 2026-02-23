import { Notion } from "@notion-site/common/utils/notion/index.js";
import {
  FaBold,
  FaCode,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
} from "react-icons/fa";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Divider } from "../../display/Divider.js";
import { Row } from "../../layout/FlexBox.js";
import { toggleAnnotations } from "../editable/notion/commands.js";
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
      {(["bold", "italic", "underline", "strikethrough", "code"] as const).map(
        (key) => (
          <ToolbarButton
            key={key}
            disabled={disabled || disabledAction}
            active={
              !!selectedBlock &&
              selection &&
              Notion.Block.isAnnotated(
                selectedBlock,
                { [key]: true },
                selection.start,
                selection.end,
              )
            }
            onClick={() => execCommand(toggleAnnotations({ [key]: true }))}
          >
            {
              {
                bold: <FaBold />,
                italic: <FaItalic />,
                underline: <FaUnderline />,
                strikethrough: <FaStrikethrough />,
                code: <FaCode />,
              }[key]
            }
          </ToolbarButton>
        ),
      )}

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

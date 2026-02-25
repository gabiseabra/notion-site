import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { pipe } from "ts-functional-pipe";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Divider } from "../../display/Divider.js";
import { Row } from "../../layout/FlexBox.js";
import { AnchoredOverlay } from "../../overlays/Overlay.js";
import { execCommand, toggleAnnotations } from "../editable/notion/commands.js";
import { Editor } from "../Editor.js";
import { useEditorSelectionRange } from "../editor/use-editor-selection-range.js";
import { AnnotationControl } from "./controls/AnnotationControl.js";
import { ColorControl } from "./controls/ColorControl.js";

export function ToolbarControls({
  editor,
  Overlay,
  ColorControl: ColorControlControl,
}: {
  editor: Editor;
  Overlay: AnchoredOverlay;
  ColorControl: ColorControl;
}) {
  const selection = useEditorSelectionRange(editor);
  const block =
    selection && editor.blocks.find(hasPropertyValue("id", selection.id));
  const text = block && Notion.Block.extractRichText(block);
  const annotations = text
    ? Notion.RTF.getAnnotations(text, selection.start, selection.end)
    : undefined;

  const disabled = !selection;
  const disabledAction =
    (!selection || SelectionRange.isCollapsed(selection)) && "action";

  return (
    <Row gap={0} alignX="start">
      <AnnotationControl
        disabled={disabled || disabledAction}
        value={annotations}
        onChange={pipe(toggleAnnotations, execCommand(editor, selection))}
      />

      <Divider direction="y" />

      <ColorControl
        Overlay={Overlay}
        Control={ColorControlControl}
        disabled={disabled || disabledAction}
        value={annotations?.color}
        onChange={pipe(
          (color) => ({ color }),
          toggleAnnotations,
          execCommand(editor, selection),
        )}
      />
    </Row>
  );
}

import { Notion } from "@notion-site/common/utils/notion/index.js";
import { pipe } from "ts-functional-pipe";
import { Divider } from "../../../display/Divider.js";
import { Row } from "../../../layout/FlexBox.js";
import { AnchoredOverlay } from "../../../overlays/Overlay.js";
import {
  focusOnLink,
  setLink,
  toggleAnnotations,
} from "../../editable/use-notion-plugin/commands.js";
import { Editor } from "../../Editor.js";
import { AnnotationControl } from "./AnnotationControl.js";
import { ColorControl } from "./ColorControl.js";
import { LinkControl } from "./LinkControl.js";
import { useToolbarControls } from "./use-toolbar-controls.js";

export function InlineControls({
  editor,
  disabled: componentDisabled,

  Overlay,
  ...controls
}: {
  editor: Editor;
  disabled?: boolean;

  Overlay: AnchoredOverlay;
  ColorControl: ColorControl;
  LinkControl: LinkControl;
}) {
  const {
    selection,
    text,
    readOnly,
    disabled: toolbarDisabled,
  } = useToolbarControls(editor);

  const disabled = componentDisabled || toolbarDisabled;
  const annotations =
    text && selection
      ? Notion.RTF.getAnnotations(text, selection.start, selection.end)
      : undefined;
  const link =
    text && selection
      ? Notion.RTF.getLink(text, selection.start, selection.end)
      : undefined;

  return (
    <Row gap={0} alignX="start" alignY="center">
      <AnnotationControl
        disabled={disabled}
        readOnly={readOnly}
        value={annotations}
        onChange={pipe(toggleAnnotations, editor.exec)}
      />

      <Divider direction="y" mx={1} />

      <ColorControl
        Overlay={Overlay}
        Control={controls.ColorControl}
        disabled={disabled}
        readOnly={readOnly}
        value={annotations?.color}
        onChange={pipe((color) => ({ color }), toggleAnnotations, editor.exec)}
      />

      <LinkControl
        Overlay={Overlay}
        Control={controls.LinkControl}
        disabled={disabled}
        readOnly={readOnly}
        value={link}
        onChange={pipe(setLink, editor.exec)}
        onOpen={() => editor.exec(focusOnLink)}
      />
    </Row>
  );
}

import { Notion } from "@notion-site/common/utils/notion/index.js";
import { pipe } from "ts-functional-pipe";
import { Divider } from "../../../display/Divider.js";
import { Row } from "../../../layout/FlexBox.js";
import { AnchoredOverlay } from "../../../overlays/Overlay.js";
import {
  focusOnLink,
  setLink,
  toggleAnnotations,
} from "../../editable/notion/commands.js";
import { Editor } from "../../Editor.js";
import { AnnotationControl } from "./AnnotationControl.js";
import { ColorControl } from "./ColorControl.js";
import { LinkControl } from "./LinkControl.js";
import { useToolbarControls } from "./use-toolbar-controls.js";

export function InlineControls({
  editor,

  Overlay,
  ...controls
}: {
  editor: Editor;

  Overlay: AnchoredOverlay;
  ColorControl: ColorControl;
  LinkControl: LinkControl;
}) {
  const { selection, text, disabled, disabledAction, execCommand } =
    useToolbarControls(editor);

  const annotations =
    text && selection && selection.type === "range"
      ? Notion.RTF.getAnnotations(text, selection.start, selection.end)
      : undefined;
  const link =
    text && selection && selection.type === "range"
      ? Notion.RTF.getLink(text, selection.start, selection.end)
      : undefined;

  return (
    <Row gap={0} alignX="start" alignY="center">
      <AnnotationControl
        disabled={disabled || disabledAction}
        value={annotations}
        onChange={pipe(toggleAnnotations, execCommand)}
      />

      <Divider direction="y" mx={1} />

      <ColorControl
        Overlay={Overlay}
        Control={controls.ColorControl}
        disabled={disabled || disabledAction}
        value={annotations?.color}
        onChange={pipe((color) => ({ color }), toggleAnnotations, execCommand)}
      />

      <LinkControl
        Overlay={Overlay}
        Control={controls.LinkControl}
        disabled={disabled || disabledAction}
        value={link}
        onChange={pipe(setLink, execCommand)}
        onOpen={() => execCommand(focusOnLink)}
      />
    </Row>
  );
}

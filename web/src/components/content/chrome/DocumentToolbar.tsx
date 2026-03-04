import { pipe } from "ts-functional-pipe";
import { Divider } from "../../display/Divider.js";
import { Row } from "../../layout/FlexBox.js";
import { AnchoredOverlayProps } from "../../overlays/Overlay.js";
import { Popover } from "../../overlays/Popover.js";
import { Editor } from "../Editor.js";
import { setBlockType } from "../editable/notion/commands.js";
import styles from "./DocumentToolbar.module.scss";
import { BlockTypeControl } from "./controls/BlockTypeControl.js";
import { MenuColorControl } from "./controls/ColorControl.js";
import { InlineControls } from "./controls/InlineControls.js";
import {
  LinkControlProps,
  PreviewLinkControl,
} from "./controls/LinkControl.js";
import { useToolbarControls } from "./controls/use-toolbar-controls.js";

export function DocumentToolbar({ editor }: { editor: Editor }) {
  const { block, execCommand, disabled } = useToolbarControls(editor);

  return (
    <Row
      gap={0}
      alignY="center"
      className={styles["document-toolbar"]}
      style={{ userSelect: "none" }}
    >
      <BlockTypeControl
        disabled={disabled}
        value={block?.type}
        onChange={pipe(setBlockType, execCommand)}
      />

      <Divider direction="y" mx={1} />

      <InlineControls
        editor={editor}
        Overlay={ToolbarPopover}
        ColorControl={MenuColorControl}
        LinkControl={ToolbarLinkControl}
      />
    </Row>
  );
}

function ToolbarPopover(props: AnchoredOverlayProps) {
  return (
    <Popover
      offset={2.5}
      placements={["bottom", "left", "right", "top"]}
      {...props}
    />
  );
}

function ToolbarLinkControl(props: LinkControlProps) {
  return <PreviewLinkControl reverse {...props} />;
}

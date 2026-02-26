import { AnchoredOverlayProps } from "../../overlays/Overlay.js";
import { Popover } from "../../overlays/Popover.js";
import { Editor } from "../Editor.js";
import styles from "./DocumentToolbar.module.scss";
import { ToolbarControls } from "./ToolbarControls.js";
import { MenuColorControl } from "./controls/ColorControl.js";
import {
  LinkControlProps,
  PreviewLinkControl,
} from "./controls/LinkControl.js";

export function DocumentToolbar({ editor }: { editor: Editor }) {
  return (
    <div className={styles["document-toolbar"]} style={{ userSelect: "none" }}>
      <ToolbarControls
        editor={editor}
        Overlay={ToolbarPopover}
        ColorControl={MenuColorControl}
        LinkControl={ToolbarLinkControl}
      />
    </div>
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

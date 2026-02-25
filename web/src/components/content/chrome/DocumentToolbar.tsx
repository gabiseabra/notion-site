import { AnchoredOverlayProps } from "../../overlays/Overlay.js";
import { Popover } from "../../overlays/Popover.js";
import { Editor } from "../Editor.js";
import styles from "./DocumentToolbar.module.scss";
import { ToolbarControls } from "./ToolbarControls.js";
import { MenuColorControl } from "./controls/ColorControl.js";

export function DocumentToolbar({ editor }: { editor: Editor }) {
  return (
    <div className={styles["document-toolbar"]}>
      <ToolbarControls
        editor={editor}
        Overlay={ToolbarPopover}
        ColorControl={MenuColorControl}
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

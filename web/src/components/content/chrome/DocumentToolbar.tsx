import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { pipe } from "ts-functional-pipe";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Divider } from "../../display/Divider.js";
import { Row } from "../../layout/FlexBox.js";
import { AnchoredOverlayProps } from "../../overlays/Overlay.js";
import { Popover } from "../../overlays/Popover.js";
import { execCommand, toggleAnnotations } from "../editable/notion/commands.js";
import { Editor } from "../Editor.js";
import { useEditorSelectionRange } from "../editor/use-editor-selection-range.js";
import { AnnotationControl } from "./AnnotationControl.js";
import { ColorControl } from "./ColorControl.js";
import styles from "./Toolbar.module.scss";

export function DocumentToolbar({ editor }: { editor: Editor }) {
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
    <div className={styles["document-toolbar"]}>
      <Row gap={0} alignX="start">
        <AnnotationControl
          disabled={disabled || disabledAction}
          value={annotations}
          onChange={pipe(toggleAnnotations, execCommand(editor, selection))}
        />

        <Divider direction="y" />

        <ColorControl
          Overlay={ToolbarPopover}
          disabled={disabled || disabledAction}
          value={annotations?.color}
          onChange={pipe(
            (color) => ({ color }),
            toggleAnnotations,
            execCommand(editor, selection),
          )}
        />
      </Row>
    </div>
  );
}

function ToolbarPopover(props: AnchoredOverlayProps) {
  return (
    <Popover
      offset={2}
      placements={["bottom", "left", "right", "top"]}
      {...props}
    />
  );
}

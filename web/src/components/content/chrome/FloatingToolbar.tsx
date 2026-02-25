import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { ReactNode, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { pipe } from "ts-functional-pipe";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { useVisualViewportEventListener } from "../../../hooks/use-visual-viewport-event-listener.js";
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

export function FloatingToolbar({ editor }: { editor: Editor }) {
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

  const portalRef = useRef<HTMLDivElement>(null);
  const PortalOverlay = useCallback(
    (props: AnchoredOverlayProps) => (
      <>
        {props.children}

        {portalRef.current &&
          props.open &&
          createPortal(props.content, portalRef.current)}
      </>
    ),
    [],
  );

  return (
    <FloatingToolbarTracker editor={editor}>
      <Row gap={0} alignX="start">
        <AnnotationControl
          disabled={disabled || disabledAction}
          value={annotations}
          onChange={pipe(toggleAnnotations, execCommand(editor, selection))}
        />

        <Divider direction="y" />

        <ColorControl
          Overlay={PortalOverlay}
          disabled={disabled || disabledAction}
          value={annotations?.color}
          onChange={pipe(
            (color) => ({ color }),
            toggleAnnotations,
            execCommand(editor, selection),
          )}
        />
      </Row>

      <div ref={portalRef} />
    </FloatingToolbarTracker>
  );
}

function FloatingToolbarTracker({
  editor,
  children,
}: {
  editor: Editor;
  children: ReactNode;
}) {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  function updateSelectionRect() {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    const selectionRect = range?.getBoundingClientRect();

    if (
      range &&
      selectionRect &&
      selectionRect.height &&
      selectionRect.width &&
      editor.blocks.some((block) =>
        editor.ref(block.id)?.contains(range.startContainer),
      )
    ) {
      setSelectionRect(selectionRect);
    } else {
      setSelectionRect(null);
    }
  }

  useDocumentEventListener("selectionchange", updateSelectionRect);

  useVisualViewportEventListener("resize", updateSelectionRect);

  return (
    <Popover
      open={!!selectionRect}
      offset={2}
      placements={["top", "right", "left", "bottom"]}
      content={children}
      style={{ wrap: { position: "absolute" } }}
    >
      <div
        style={{
          width: selectionRect?.width ?? 0,
          height: "1em",
          position: "fixed",
          top: selectionRect?.top ?? -1,
          left: selectionRect?.left ?? -1,
        }}
      />
    </Popover>
  );
}

import { ReactNode, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { useVisualViewportEventListener } from "../../../hooks/use-visual-viewport-event-listener.js";
import { AnchoredOverlayProps } from "../../overlays/Overlay.js";
import { Popover } from "../../overlays/Popover.js";
import { Editor } from "../Editor.js";
import { ToolbarControls } from "./ToolbarControls.js";

export function FloatingToolbar({ editor }: { editor: Editor }) {
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
      <ToolbarControls editor={editor} Overlay={PortalOverlay} />

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

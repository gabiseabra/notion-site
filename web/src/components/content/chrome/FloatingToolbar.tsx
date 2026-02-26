import { hash } from "@notion-site/common/utils/hash.js";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { useRafThrottledCallback } from "../../../hooks/use-raf-throttled-callback.js";
import { useVisualViewportEventListener } from "../../../hooks/use-visual-viewport-event-listener.js";
import { AnchoredOverlayProps } from "../../overlays/Overlay.js";
import { Popover } from "../../overlays/Popover.js";
import { Editor } from "../Editor.js";
import styles from "./FloatingMenu.module.scss";
import { ToolbarControls } from "./ToolbarControls.js";
import { SwatchColorControl } from "./controls/ColorControl.js";

export function FloatingToolbar({ editor }: { editor: Editor }) {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const updateSelectionRect = useRafThrottledCallback(() => {
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
  }, [editor]);

  useDocumentEventListener("selectionchange", updateSelectionRect);
  useVisualViewportEventListener("resize", updateSelectionRect);

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
    <Popover
      open={!!selectionRect}
      updateKey={hash(selectionRect)}
      offset={2}
      placements={["top", "right", "left", "bottom"]}
      content={
        <div
          className={styles["floating-toolbar"]}
          style={{ userSelect: "none" }}
        >
          <ToolbarControls
            editor={editor}
            Overlay={PortalOverlay}
            ColorControl={SwatchColorControl}
          />

          <div ref={portalRef} />
        </div>
      }
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

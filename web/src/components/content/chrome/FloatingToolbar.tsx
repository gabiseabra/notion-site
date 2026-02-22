import { useState } from "react";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { Popover } from "../../overlays/Popover.js";
import { Editor } from "../Editor.js";
import { Toolbar } from "./Toolbar.js";

export function FloatingToolbar({ editor }: { editor: Editor }) {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  useDocumentEventListener("selectionchange", () => {
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
  });

  return (
    <Popover
      open={!!selectionRect}
      offset={2}
      placements={["top", "right", "left", "bottom"]}
      content={<Toolbar editor={editor} />}
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

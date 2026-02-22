import { useState } from "react";
import { useWindowEventListener } from "../../../hooks/use-window-event-listener.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, ContentEditor } from "./types.js";

type EditorSelectionRange = {
  /** Currently selected block id. */
  id: string;
} & SelectionRange;

export function useEditorSelectionRange<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
): EditorSelectionRange | null {
  const [selectionRange, setSelectionRange] =
    useState<EditorSelectionRange | null>(null);

  useWindowEventListener("selectionchange", () => {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;

    if (!range) return;

    for (const { id } of editor.blocks) {
      const element = editor.ref(id);

      if (!element || !element.contains(range.startContainer)) continue;

      const selection = SelectionRange.read(element);

      if (selection) {
        setSelectionRange({ id, ...selection });
        return;
      }
    }
  });

  return selectionRange;
}

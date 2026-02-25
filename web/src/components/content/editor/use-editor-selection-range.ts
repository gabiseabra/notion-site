import { useCallback, useEffect, useState } from "react";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, ContentEditor } from "./types.js";

type EditorSelectionRange<TBlock extends AnyBlock> = {
  /** Currently selected block id. */
  id: TBlock["id"];
} & SelectionRange;

export function useEditorSelectionRange<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
): EditorSelectionRange<TBlock> | null {
  const [selectionRange, setSelectionRange] =
    useState<EditorSelectionRange<TBlock> | null>(null);

  const readSelectionRange = useCallback(() => {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;

    if (!range) return null;

    for (const { id } of editor.blocks) {
      const element = editor.ref(id);

      if (!element || !element.contains(range.startContainer)) continue;

      const selection = SelectionRange.read(element);

      if (selection) {
        return { id, ...selection };
      }
    }
    return null;
  }, [editor]);

  useDocumentEventListener("selectionchange", () => {
    setSelectionRange(readSelectionRange());
  });

  // Set selection on mount
  useEffect(() => {
    setSelectionRange(readSelectionRange());
  }, []);

  return selectionRange;
}

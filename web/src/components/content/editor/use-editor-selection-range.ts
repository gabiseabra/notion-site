import { useEffect, useState } from "react";
import { guardDispatch } from "../../../hooks/guard-dispatch.js";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { EditorSelection } from "./editor-selection.js";
import { AnyBlock, ContentEditor } from "./types.js";

export function useEditorSelectionRange<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
): EditorSelection<TBlock> | null {
  const [selectionRange, setSelectionRange] =
    useState<EditorSelection<TBlock> | null>(null);

  useDocumentEventListener("selectionchange", () => {
    setSelectionRange(guardDispatch(EditorSelection.read(editor)));
  });

  // Set selection on mount
  useEffect(() => {
    setSelectionRange(EditorSelection.read(editor));
  }, []);

  return selectionRange;
}

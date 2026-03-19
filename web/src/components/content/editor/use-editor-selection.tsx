import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { guardDispatch } from "../../../hooks/guard-dispatch.js";
import { useDocumentEventListener } from "../../../hooks/use-document-event-listener.js";
import { EditorSelection } from "./editor-selection.js";
import { AnyBlock, ContentEditor } from "./types.js";

type GetSelection = <TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
) => EditorSelection<TBlock> | null;

const EditorSelectionContext = createContext<GetSelection>(() => null);

export function useEditorSelection<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
): EditorSelection<TBlock> | null {
  const getSelection = useContext(EditorSelectionContext);
  return getSelection(editor);
}

export function EditorSelectionProvider<TBlock extends AnyBlock>({
  editor,
  children,
}: {
  editor: ContentEditor<TBlock>;
  children: ReactNode;
}) {
  const [selectionRange, setSelectionRange] =
    useState<EditorSelection<TBlock> | null>(null);
  const getSelection = useCallback<GetSelection>(
    (targetEditor) => {
      if ((targetEditor as unknown) === (editor as unknown))
        return selectionRange;
      return null;
    },
    [editor, selectionRange],
  );

  useDocumentEventListener("selectionchange", () => {
    setSelectionRange(guardDispatch(EditorSelection.read(editor)));
  });

  // Set selection on mount
  useEffect(() => {
    setSelectionRange(EditorSelection.read(editor));
  }, []);

  return (
    <EditorSelectionContext.Provider value={getSelection}>
      {children}
    </EditorSelectionContext.Provider>
  );
}

import {
  createContext,
  ReactNode,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
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
  ref,
  editor,
  children,
}: {
  ref?: Ref<EditorSelectionProvider.Ref<TBlock>>;
  editor: ContentEditor<TBlock>;
  children: ReactNode;
}) {
  const [selection, setSelectionRange] =
    useState<EditorSelection<TBlock> | null>(null);
  const getSelection = useCallback<GetSelection>(
    (targetEditor) => {
      if ((targetEditor as unknown) === (editor as unknown)) return selection;
      return null;
    },
    [editor, selection],
  );

  useDocumentEventListener("selectionchange", () => {
    setSelectionRange(guardDispatch(EditorSelection.read(editor)));
  });

  // Set selection on mount
  useEffect(() => {
    setSelectionRange(EditorSelection.read(editor));
  }, []);

  useImperativeHandle(ref, () => ({ selection }), [selection]);

  return (
    <EditorSelectionContext.Provider value={getSelection}>
      {children}
    </EditorSelectionContext.Provider>
  );
}

export namespace EditorSelectionProvider {
  export type Ref<TBlock extends AnyBlock> = {
    selection: EditorSelection<TBlock> | null;
  };
}

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
import { EditorTarget } from "./editor-target.js";
import { AnyBlock, ContentEditor } from "./types.js";

type GetTarget = <TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
) => EditorTarget<TBlock> | null;

const EditorTargetContext = createContext<GetTarget>(() => null);

export function useEditorTarget<TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
): EditorTarget<TBlock> | null {
  const getSelection = useContext(EditorTargetContext);
  return getSelection(editor);
}

export function EditorTargetProvider<TBlock extends AnyBlock>({
  ref,
  editor,
  children,
}: {
  ref?: Ref<EditorTargetProvider.Ref<TBlock>>;
  editor: ContentEditor<TBlock>;
  children: ReactNode;
}) {
  const [selection, setSelectionRange] = useState<EditorTarget<TBlock> | null>(
    null,
  );
  const getSelection = useCallback<GetTarget>(
    (targetEditor) => {
      if ((targetEditor as unknown) === (editor as unknown)) return selection;
      return null;
    },
    [editor, selection],
  );

  useDocumentEventListener("selectionchange", () => {
    setSelectionRange(guardDispatch(EditorTarget.read(editor)));
  });

  // Set selection on mount
  useEffect(() => {
    setSelectionRange(EditorTarget.read(editor));
  }, []);

  useImperativeHandle(ref, () => ({ selection }), [selection]);

  return (
    <EditorTargetContext.Provider value={getSelection}>
      {children}
    </EditorTargetContext.Provider>
  );
}

export namespace EditorTargetProvider {
  export type Ref<TBlock extends AnyBlock> = {
    selection: EditorTarget<TBlock> | null;
  };
}

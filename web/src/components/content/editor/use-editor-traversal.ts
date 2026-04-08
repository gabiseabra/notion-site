import { Traversal } from "@notion-site/common/utils/optics/traversal.js";
import { AnyBlock, ContentEditor } from "./types";
import { useEditorLens } from "./use-editor-lens";

export function useEditorTraversal<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id,
  editor,
  traversal,
  fallback = (b) => b,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  traversal: Traversal<TParent, TBlock>;
  fallback?: (b: TBlock) => TBlock;
}) {
  return useEditorLens({
    id,
    editor,
    lens: {
      get: traversal.get,
      set: (parent, blocks) =>
        traversal.modify(
          parent,
          (b) => blocks.find((c) => b.id === c.id) ?? fallback(b),
        ),
    },
  });
}

import { NonEmpty } from "@notion-site/common/utils/non-empty.js";
import { Prism } from "@notion-site/common/utils/prism.js";
import { AnyBlock, ContentEditor } from "./types";
import { useEditorLens } from "./use-editor-lens";

export function useEditorPrism<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id,
  editor,
  prism,
  join = ([block]) => block,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  prism: Prism<TParent, TBlock>;
  join?: (blocks: NonEmpty<TBlock>) => TBlock;
}) {
  return useEditorLens({
    id,
    editor,
    lens: {
      get: (parent) => {
        const a = prism.get(parent);
        return a !== undefined ? [a] : [];
      },
      set: (parent, blocks) => {
        return NonEmpty.isNonEmpty(blocks)
          ? prism.set(parent, join(blocks))
          : parent;
      },
    },
  });
}

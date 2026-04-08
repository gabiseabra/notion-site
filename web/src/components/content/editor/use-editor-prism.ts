import { Iso } from "@notion-site/common/utils/optics/iso.js";
import { Prism } from "@notion-site/common/utils/optics/prism.js";
import { AnyBlock, ContentEditor } from "./types";
import { useEditorLens } from "./use-editor-lens";

export function useEditorPrism<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id,
  editor,
  prism,
  iso = {
    view: (block) => [block],
    review: ([block]) => block,
  },
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  prism: Prism<TParent, TBlock>;
  iso?: Iso<TBlock, TBlock[]>;
}) {
  return useEditorLens({
    id,
    editor,
    lens: {
      get: (parent) => {
        const a = prism.get(parent);
        return typeof a !== "undefined" ? iso.view(a) : [];
      },
      set: (parent, blocks) => {
        return prism.set(parent, iso.review(blocks));
      },
    },
  });
}

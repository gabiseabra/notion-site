import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { AnyBlock, ContentEditor, ID } from "./types";

export type BlockRef = {
  element: HTMLElement | null;
  children: Map<ID, HTMLElement>;
};

export const BlockRef = {
  all(editor: ContentEditor<AnyBlock>) {
    return editor.blocks
      .flatMap((block) =>
        BlockRef.entries(editor.ref(block.id)).map(
          ([childId, element]) => [block.id, childId, element] as const,
        ),
      )
      .sort(([, , a], [, , b]) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
  },

  entries(ref: BlockRef) {
    return [
      ref.element && ([undefined as ID | undefined, ref.element] as const),
      ...Array.from(ref.children.entries()),
    ].filter(isNonNullable);
  },
};

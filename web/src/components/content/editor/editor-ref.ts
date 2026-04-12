import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { AnyBlock, ContentEditor, ID } from "./types";

export type EditorRef<TBlock extends AnyBlock> = {
  id: TBlock["id"];
  childId?: ID;
  element: HTMLElement;
};

export type EditorRefMapEntry = {
  element: HTMLElement | null;
  children: Map<ID, HTMLElement>;
};

export type EditorRefMap<TBlock extends AnyBlock> = Map<
  TBlock["id"],
  EditorRefMapEntry
>;

export const EditorRef = {
  read<TBlock extends AnyBlock>(
    editor: ContentEditor<TBlock>,
    id?: TBlock["id"],
  ): EditorRef<TBlock>[] {
    return editor.blocks
      .filter((block) => typeof id === "undefined" || block.id === id)
      .flatMap((block) => fromEntry<TBlock>(editor.ref(block.id), block.id))
      .sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
  },
};

function fromEntry<TBlock extends AnyBlock>(
  ref: EditorRefMapEntry,
  id: TBlock["id"],
): EditorRef<TBlock>[] {
  return [
    ref.element && ([undefined as ID | undefined, ref.element] as const),
    ...Array.from(ref.children.entries()),
  ]
    .filter(isNonNullable)
    .map(([childId, element]) => ({ id, childId, element }));
}

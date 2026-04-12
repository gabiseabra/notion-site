import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { AnyBlock, ContentEditor, ID } from "./types";

export type EditorRef<TBlock extends AnyBlock> = {
  id: TBlock["id"];
  childId?: ID;
  element: HTMLElement;
};

export namespace EditorRef {
  export type MapEntry = {
    element: HTMLElement | null;
    children: globalThis.Map<ID, HTMLElement>;
  };

  export type Map<TBlock extends AnyBlock> = globalThis.Map<
    TBlock["id"],
    MapEntry
  >;

  export function read<TBlock extends AnyBlock>(
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
  }

  export function fromEntry<TBlock extends AnyBlock>(
    ref: MapEntry,
    id: TBlock["id"],
  ): EditorRef<TBlock>[] {
    return [
      ref.element && ([undefined as ID | undefined, ref.element] as const),
      ...Array.from(ref.children.entries()),
    ]
      .filter(isNonNullable)
      .map(([childId, element]) => ({ id, childId, element }));
  }
}

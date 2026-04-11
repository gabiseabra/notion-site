import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, BlockRef, ContentEditor, ID } from "./types.js";

export type EditorTarget<TBlock extends AnyBlock> = SelectionRange & {
  id: TBlock["id"];
  childId?: ID;
};

const EMPTY_ID = Symbol("EMPTY_ID");

export const EditorTarget = {
  empty<TBlock extends AnyBlock>(): EditorTarget<TBlock> {
    return { id: EMPTY_ID, start: 0, end: 0 };
  },

  isEmpty(target: EditorTarget<AnyBlock>) {
    return target.id === EMPTY_ID;
  },

  /**
   * Read current selection from editor elements, returns null if none of the
   * editor's blocks are active
   */
  read<TBlock extends AnyBlock>(
    editor: ContentEditor<TBlock>,
    targetId?: TBlock["id"],
    targetChildId?: ID,
  ): EditorTarget<TBlock> | null {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;

    if (!range) return null;

    const allElements = editor.blocks
      .flatMap((block) =>
        BlockRef.entries(editor.ref(block.id)).map(
          ([childId, element]) => [block.id, childId, element] as const,
        ),
      )
      .filter(
        ([id, childId]) =>
          !(typeof targetId !== "undefined" && targetId !== id) &&
          !(typeof targetChildId !== "undefined" && targetChildId !== childId),
      );

    const activeElement = allElements.find(
      ([, , element]) =>
        element.contains(range.startContainer) ||
        element.contains(document.activeElement),
    );

    if (!activeElement) return null;

    const [id, childId, element] = activeElement;
    const selection = SelectionRange.read(element);

    if (!selection) return null;

    return { ...selection, id, childId };
  },

  end<TBlock extends AnyBlock>(
    editor: ContentEditor<TBlock>,
    id: TBlock["id"],
    childId?: ID,
  ): EditorTarget<TBlock> {
    const element =
      typeof childId === "undefined"
        ? editor.ref(id).element
        : editor.ref(id).children.get(childId);
    const content =
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
        ? element.value
        : element?.textContent;
    const end = content?.length ?? 0;

    return { id, childId, end, start: end };
  },
};

import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, ContentEditor, ID } from "./types.js";

export type EditorTarget<TBlock extends AnyBlock> = SelectionRange & {
  id: TBlock["id"];
  childId?: ID;
};

export const EditorTarget = {
  read<TBlock extends AnyBlock>(
    editor: ContentEditor<TBlock>,
  ): EditorTarget<TBlock> | null {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;

    if (!range) return null;

    const isActive = (element: HTMLElement) =>
      element.contains(range.startContainer) ||
      element.contains(document.activeElement);

    for (const { id } of editor.blocks) {
      const ref = editor.ref(id);
      const [childId, element] = (() => {
        if (ref.element && isActive(ref.element))
          return [undefined, ref.element] as const;
        return (
          Array.from(ref.children.entries()).find(
            ([, element]) => element && isActive(element),
          ) ?? []
        );
      })();
      const selection = element && SelectionRange.read(element);

      if (selection && element === ref.element)
        return { id, childId, ...selection };
    }
    return null;
  },
};

import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, ContentEditor } from "./types.js";

export type EditorSelection<TBlock extends AnyBlock> =
  | (SelectionRange & {
      type: "range";
      id: TBlock["id"];
    })
  | {
      type: "focus";
      id: TBlock["id"];
    };

export const EditorSelection = {
  read<TBlock extends AnyBlock>(
    editor: ContentEditor<TBlock>,
  ): EditorSelection<TBlock> | null {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;

    if (!range) return null;

    for (const { id } of editor.blocks) {
      const element = editor.ref(id);

      if (!element || !element.contains(range.startContainer)) continue;

      const selection = SelectionRange.read(element);

      if (selection) {
        return { type: "range", id, ...selection };
      }
      if (element.contains(document.activeElement)) {
        return { type: "focus", id };
      }
    }
    return null;
  },
};

import { SelectionRange } from "../../../utils/selection-range.js";
import { AnyBlock, ContentEditor } from "./types.js";

export type EditorTarget<TBlock extends AnyBlock> =
  | (SelectionRange & {
      type: "range";
      id: TBlock["id"];
    })
  | {
      type: "focus";
      id: TBlock["id"];
    };

export const EditorTarget = {
  read<TBlock extends AnyBlock>(
    editor: ContentEditor<TBlock>,
  ): EditorTarget<TBlock> | null {
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

  isRange<TBlock extends AnyBlock>(
    selection: EditorTarget<TBlock>,
  ): selection is Extract<EditorTarget<TBlock>, { type: "range" }> {
    return selection.type === "range";
  },

  extractRange<TBlock extends AnyBlock>(
    selection: EditorTarget<TBlock>,
  ): Extract<EditorTarget<TBlock>, { type: "range" }> | null {
    return EditorTarget.isRange(selection) ? selection : null;
  },
};

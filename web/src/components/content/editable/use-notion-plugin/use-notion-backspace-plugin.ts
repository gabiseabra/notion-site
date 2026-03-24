import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { ContentEditorPlugin } from "../types.js";

/**
 * Handles backspace for list and to-do items by downgrading the block to a paragraph.
 */
export const useNotionBackspacePlugin: ContentEditorPlugin<Notion.Block> =
  (editor) => (block) => ({
    onKeyDown(e) {
      if (
        (block.type !== "bulleted_list_item" &&
          block.type !== "numbered_list_item" &&
          block.type !== "to_do") ||
        e.key !== "Backspace"
      )
        return;

      const selection = SelectionRange.read(e.currentTarget);

      if (
        !selection ||
        !SelectionRange.isCollapsed(selection) ||
        selection.start !== 0
      )
        return;

      const data = `use-notion-backspace-plugin`;
      editor.push(
        {
          type: "update",
          block: Notion.Block.mapRichText(
            Notion.WIP.create({
              type: "paragraph",
              id: block.id,
              parent: block.parent,
            }),
            () => Notion.Block.extractRichText(editor.peek(block.id) ?? block),
          ),
          selectionBefore: selection,
          selectionAfter: selection,
        },
        data,
      );
      editor.commit(data);

      e.preventDefault();
      e.stopPropagation();
    },
  });

import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { ContentEditorPlugin } from "./../types.js";

export const useNotionPrefixPlugin =
  (
    prefix: string,
    type: Notion.Block.BlockType,
  ): ContentEditorPlugin<Notion.Block> =>
  (editor) =>
  (block) => ({
    onInput(e) {
      if (
        block.type === type ||
        e.nativeEvent.data !== " " ||
        !e.currentTarget.textContent?.startsWith(prefix)
      )
        return;

      const selection = SelectionRange.read(e.currentTarget);

      if (
        !selection ||
        !SelectionRange.isCollapsed(selection) ||
        selection.start !== prefix.length + 1
      )
        return;

      const currentBlock = editor.peek(block.id) ?? block;
      const newBlock = Notion.Block.mapRichText(
        Notion.WIP.create({
          type,
          id: block.id,
          parent: block.parent,
        }),
        () =>
          Notion.RTF.slice(
            Notion.Block.extractRichText(currentBlock),
            prefix.length,
          ),
      );

      const data = `use-notion-prefix-plugin: ${type}`;
      editor.flush(data);
      editor.update(newBlock, {
        data,
        selectionBefore: selection,
        selectionAfter: { start: 0, end: 0 },
      });
      editor.commit(data);
    },
  });

import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { EditorCommand } from "../../editor/editor-command.js";
import { composePlugins } from "../compose-plugins.js";
import { ContentEditorPlugin } from "./../types.js";

/**
 * Creates a plugin that converts a block when the user types a recognized prefix followed by a space.
 *
 * Triggered on space input when the caret is positioned immediately after the prefix
 * (at `prefix.length + 1`). On trigger, the block is replaced with the result of `transform`.
 * If `transform` returns `undefined`, the conversion is skipped.
 *
 * @param regExp - Regex matched against the block's full text content, anchored to start (`^`)
 * @param transform - Command that produces the replacement block from the current block and regex match
 */
const useNotionPrefixPlugin =
  (
    regExp: RegExp,
    transform: EditorCommand<Notion.Block, RegExpMatchArray>,
  ): ContentEditorPlugin<Notion.Block> =>
  (editor) =>
  (block) => ({
    onInput(e) {
      if (e.nativeEvent.data !== " ") return;

      const match = e.currentTarget.textContent?.match(regExp);
      const selection = SelectionRange.read(e.currentTarget);

      if (
        !match ||
        !selection ||
        !SelectionRange.isCollapsed(selection) ||
        selection.start !== match[0].length + 1
      )
        return;

      const newBlock = transform(editor.peek(block.id) ?? block, match, editor);

      if (!newBlock) return;

      const data = `use-notion-prefix-plugin`;
      editor.flush(data);
      editor.update(newBlock, {
        data,
        selectionBefore: selection,
        selectionAfter: { start: 0, end: 0 },
      });
      editor.commit(data);
    },
  });

const createBlock =
  (
    type: Notion.Block.BlockType,
  ): EditorCommand<Notion.Block, RegExpMatchArray> =>
  (block, match) => {
    if (block.type === type) return;
    return Notion.Block.mapRichText(
      Notion.WIP.create({
        type,
        id: block.id,
        parent: block.parent,
      }),
      () =>
        Notion.RTF.slice(
          Notion.Block.extractRichText(block),
          match[0].length + 1,
        ),
    );
  };

const createNumberedList: EditorCommand<Notion.Block, RegExpMatchArray> = (
  block,
  match,
  editor,
) => {
  const siblings = editor.blocks.filter((b) =>
    Notion.Block.parentEquals(b.parent, block.parent),
  );
  const currentIndex = siblings.findIndex(hasPropertyValue("id", block.id));
  const targetNumber = parseInt(match[1], 10);
  const nextNumber = (() => {
    for (let i = currentIndex - 1, n = 1; i > 0; i--) {
      const block = siblings[i];
      if (block?.type === "numbered_list_item")
        n += block.numbered_list_item.list_start_index ?? 1;
      else return n;
    }
    return 1;
  })();

  if (nextNumber && nextNumber > 1 && targetNumber !== nextNumber) return;

  return Notion.WIP.create({
    type: "numbered_list_item",
    id: block.id,
    parent: block.parent,
    numbered_list_item: {
      color: "default",
      rich_text: Notion.RTF.slice(
        Notion.Block.extractRichText(block),
        match[0].length + 1,
      ),
      list_start_index: nextNumber > 1 ? undefined : targetNumber,
    },
  });
};

const useNotionPrefixPluginPreset = composePlugins(
  useNotionPrefixPlugin(/^#/, createBlock("heading_1")),
  useNotionPrefixPlugin(/^##/, createBlock("heading_2")),
  useNotionPrefixPlugin(/^###/, createBlock("heading_3")),
  useNotionPrefixPlugin(/^-/, createBlock("bulleted_list_item")),
  useNotionPrefixPlugin(/^(\d+)\./, createNumberedList),
  useNotionPrefixPlugin(/^\[ \]/, createBlock("to_do")),
);

export { useNotionPrefixPluginPreset as useNotionPrefixPlugin };

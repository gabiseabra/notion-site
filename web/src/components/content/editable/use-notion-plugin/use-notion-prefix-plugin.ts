import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { EditorCommand } from "../../editor/editor-command.js";
import { composePlugins } from "../compose-plugins.js";
import { useRegExpTransformPlugin } from "../use-regexp-transform-plugin.js";

function createBlock<T extends Notion.Block.BlockType>(
  type: T,
  map?: (block: Notion.Block.Block<T>) => Notion.Block.Block<T>,
): EditorCommand<Notion.Block, RegExpMatchArray>;
function createBlock(
  type: Notion.Block.BlockType,
  map: (block: Notion.Block) => Notion.Block = (x) => x,
): EditorCommand<Notion.Block, RegExpMatchArray> {
  return ({ block, data: match }) => {
    if (block.type === type) return;
    return map(
      Notion.Block.mapRichText(
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
      ),
    );
  };
}

const createNumberedList: EditorCommand<Notion.Block, RegExpMatchArray> = ({
  block,
  data: match,
  editor,
}) => {
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

export const useNotionPrefixPlugin = composePlugins(
  useRegExpTransformPlugin(/^#/, " ", createBlock("heading_1")),
  useRegExpTransformPlugin(/^##/, " ", createBlock("heading_2")),
  useRegExpTransformPlugin(/^###/, " ", createBlock("heading_3")),
  useRegExpTransformPlugin(/^-/, " ", createBlock("bulleted_list_item")),
  useRegExpTransformPlugin(/^(\d+)\./, " ", createNumberedList),
  useRegExpTransformPlugin(/^\[ \]/, " ", createBlock("to_do")),
  useRegExpTransformPlugin(
    /^\[x\]/,
    " ",
    createBlock("to_do", (block) => ({
      ...block,
      to_do: {
        ...block.to_do,
        checked: true,
      },
    })),
  ),
  useRegExpTransformPlugin(/^```/, " ", createBlock("code"), {
    childId: "code",
    start: 0,
    end: 0,
  }),
);

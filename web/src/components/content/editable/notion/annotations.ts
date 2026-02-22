import { Notion } from "@notion-site/common/utils/notion/index.js";
import * as env from "../../../../env.js";
import { SelectionRange } from "../../../../utils/selection-range.js";

const toggleAnnotation =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) => {
    if (!Notion.Block.isRichText(block) || selection.start === selection.end)
      return block;
    return Notion.Block.map(block, (node) => ({
      ...node,
      rich_text: Notion.RTF.toggleAnnotations(
        node.rich_text,
        annotations,
        selection.start,
        selection.end,
      ),
    }));
  };

const isAnnotated =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) => {
    return (
      Notion.Block.isRichText(block) &&
      Notion.RTF.isAnnotated(
        Notion.Block.extract(block).rich_text,
        annotations,
        selection.start,
        selection.end,
      )
    );
  };

const Mod = env.IS_MAC ? "Meta" : "Ctrl";

export const NotionAnnotations = {
  bold: {
    key: `${Mod}+b`,
    apply: toggleAnnotation({ bold: true }),
    isActive: isAnnotated({ bold: true }),
  },
  underline: {
    key: `${Mod}+u`,
    apply: toggleAnnotation({ underline: true }),
    isActive: isAnnotated({ underline: true }),
  },
  italic: {
    key: `${Mod}+i`,
    apply: toggleAnnotation({ italic: true }),
    isActive: isAnnotated({ italic: true }),
  },
  striketrough: {
    key: `${Mod}+Shift+s`,
    apply: toggleAnnotation({ strikethrough: true }),
    isActive: isAnnotated({ strikethrough: true }),
  },
} as const;

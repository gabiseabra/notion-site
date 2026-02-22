import { Notion } from "@notion-site/common/utils/notion/index.js";
import { keys } from "@notion-site/common/utils/object.js";
import { FaBold, FaItalic, FaStrikethrough, FaUnderline } from "react-icons/fa";
import * as env from "../../../../env.js";
import { SelectionRange } from "../../../../utils/selection-range.js";

export const isAnnotated =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) => {
    if (!Notion.Block.isRichText(block)) return false;
    const selectedText = Notion.RTF.findByRange(
      Notion.Block.extract(block).rich_text,
      selection.start,
      selection.end,
    );

    return (
      selectedText.length > 0 &&
      selectedText.every(
        (item) =>
          item.type === "text" && Notion.RTF.isItemAnnotated(item, annotations),
      )
    );
  };

export const toggleAnnotation =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) => {
    if (!Notion.Block.isRichText(block) || selection.start === selection.end)
      return block;

    return Notion.Block.mapRichText(block, (rich_text) =>
      Notion.RTF.setAnnotations(
        rich_text,
        !isAnnotated(annotations)(block, selection)
          ? annotations
          : (Object.fromEntries(
              keys(annotations).map(
                (a) => [a, Notion.RTF.empty_text.annotations[a]] as const,
              ),
            ) satisfies Partial<Notion.RTF.Annotations>),
        selection.start,
        selection.end,
      ),
    );
  };

const Mod = env.IS_MAC ? "Meta" : "Ctrl";

export const NotionAnnotations = {
  bold: {
    key: `${Mod}+b`,
    apply: toggleAnnotation({ bold: true }),
    isActive: isAnnotated({ bold: true }),
    icon: <FaBold />,
  },
  underline: {
    key: `${Mod}+u`,
    apply: toggleAnnotation({ underline: true }),
    isActive: isAnnotated({ underline: true }),
    icon: <FaUnderline />,
  },
  italic: {
    key: `${Mod}+i`,
    apply: toggleAnnotation({ italic: true }),
    isActive: isAnnotated({ italic: true }),
    icon: <FaItalic />,
  },
  striketrough: {
    key: `${Mod}+Shift+s`,
    apply: toggleAnnotation({ strikethrough: true }),
    isActive: isAnnotated({ strikethrough: true }),
    icon: <FaStrikethrough />,
  },
} as const;

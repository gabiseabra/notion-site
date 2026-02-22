import { Notion } from "@notion-site/common/utils/notion/index.js";
import { FaBold, FaItalic, FaStrikethrough, FaUnderline } from "react-icons/fa";
import * as env from "../../../../env.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { EditorCommand } from "../types.js";

export const isAnnotated =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) =>
    Notion.Block.isAnnotated(
      block,
      annotations,
      selection.start,
      selection.end,
    );

export const toggleAnnotations =
  (annotations: Partial<Notion.RTF.Annotations>): EditorCommand<Notion.Block> =>
  (block: Notion.Block, selection: SelectionRange) =>
    Notion.Block.toggleAnnotations(
      block,
      annotations,
      selection.start,
      selection.end,
    );

const Mod = env.IS_MAC ? "Meta" : "Ctrl";

export const NotionAnnotations = {
  bold: {
    key: `${Mod}+b`,
    apply: toggleAnnotations({ bold: true }),
    isActive: isAnnotated({ bold: true }),
    icon: <FaBold />,
  },
  underline: {
    key: `${Mod}+u`,
    apply: toggleAnnotations({ underline: true }),
    isActive: isAnnotated({ underline: true }),
    icon: <FaUnderline />,
  },
  italic: {
    key: `${Mod}+i`,
    apply: toggleAnnotations({ italic: true }),
    isActive: isAnnotated({ italic: true }),
    icon: <FaItalic />,
  },
  striketrough: {
    key: `${Mod}+Shift+s`,
    apply: toggleAnnotations({ strikethrough: true }),
    isActive: isAnnotated({ strikethrough: true }),
    icon: <FaStrikethrough />,
  },
} as const;

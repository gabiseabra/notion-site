import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { EditorCommand } from "../types.js";

export const isAnnotated =
  (annotations: Partial<Notion.RTF.Annotations>) =>
  (block: Notion.Block, selection: SelectionRange) =>
    Notion.RTF.isAnnotated(
      Notion.Block.extractRichText(block),
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

export const setLink =
  (link: Notion.RTF.Link): EditorCommand<Notion.Block> =>
  (block: Notion.Block, selection: SelectionRange) =>
    Notion.Block.mapRichText(block, (rich_text) =>
      Notion.RTF.setLink(rich_text, link, selection.start, selection.end),
    );

export const focusOnLink: EditorCommand<Notion.Block> = (block, selection) => {
  const range = Notion.RTF.findLinkRange(
    Notion.Block.extractRichText(block),
    selection.start,
  );
  const sel = document.getSelection();
  const element =
    sel?.getRangeAt(0)?.commonAncestorContainer.parentElement?.parentElement;

  if (
    range &&
    element &&
    selection.start !== range.start &&
    selection.end !== range.end
  ) {
    SelectionRange.apply(element, range);
  }
};

export const setBlockType =
  (type: Notion.Block.BlockType): EditorCommand<Notion.Block> =>
  (block) => {
    return Notion.Block.mapRichText(
      Notion.WIP.create({
        type,
        id: block.id,
        has_children: block.has_children,
        parent: block.parent,
      }),
      () => Notion.Block.extractRichText(block),
    );
  };

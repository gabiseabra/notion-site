import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { EditorCommand } from "../../editor/editor-command";
import { EditorSelection } from "../../editor/editor-selection";

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
  (block, selection) =>
    selection.type === "range"
      ? Notion.Block.toggleAnnotations(
          block,
          annotations,
          selection.start,
          selection.end,
        )
      : undefined;

export const setLink =
  (link: Notion.RTF.Link): EditorCommand<Notion.Block> =>
  (block, selection) =>
    selection.type === "range"
      ? Notion.Block.mapRichText(block, (rich_text) =>
          Notion.RTF.setLink(rich_text, link, selection.start, selection.end),
        )
      : undefined;

export const focusOnLink: EditorCommand<Notion.Block> = (block, selection) => {
  const selectionRange =
    selection.type === "range"
      ? selection
      : {
          start: 0,
          end: Notion.RTF.getContent(Notion.Block.extractRichText(block))
            .length,
        };
  const range = Notion.RTF.findLinkRange(
    Notion.Block.extractRichText(block),
    selectionRange.start,
  );
  const sel = document.getSelection();
  const element =
    sel?.getRangeAt(0)?.commonAncestorContainer.parentElement?.parentElement;

  if (
    range &&
    element &&
    selectionRange.start !== range.start &&
    selectionRange.end !== range.end
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

export const downgradeBlock =
  (block: Notion.Block): EditorCommand<Notion.Block> =>
  (_block, _selection, editor) => {
    const data = "delete-block-command";

    editor.update(
      Notion.Block.mapRichText(
        Notion.WIP.create({
          type: "paragraph",
          parent: block.parent,
          id: block.id,
        }),
        () => Notion.Block.extractRichText(block),
      ),
      {
        data,
        selectionBefore: { start: 0, end: 0 },
        selectionAfter: { start: 0, end: 0 },
      },
    );
    editor.commit(data);
  };

export const updateBlock =
  (block: Notion.Block): EditorCommand<Notion.Block> =>
  (_block, _selection, editor) => {
    const data = "update-block-command";
    const selection = EditorSelection.read(editor);
    const selectionRange =
      !selection || selection.type === "focus"
        ? {
            id: block.id,
            start: 0,
            end: 0,
          }
        : selection;

    editor.update(block, {
      data,
      selectionAfter:
        selectionRange?.id === block.id
          ? selectionRange
          : {
              start: 0,
              end: 0,
              id: block.id,
            },
      selectionBefore: selectionRange ?? undefined,
    });
    editor.commit(data);
  };

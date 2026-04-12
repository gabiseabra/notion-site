import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { EditorCommand } from "../../editor/editor-command";
import { EditorTarget } from "../../editor/editor-target.js";
import { ID } from "../../editor/types";

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
  ({ block, data: selection }) =>
    selection
      ? Notion.Block.toggleAnnotations(
          block,
          annotations,
          selection.start,
          selection.end,
        )
      : undefined;

export const setLink =
  (link: Notion.RTF.Link): EditorCommand<Notion.Block> =>
  ({ block, data: selection }) =>
    selection
      ? Notion.Block.mapRichText(block, (rich_text) =>
          Notion.RTF.setLink(rich_text, link, selection.start, selection.end),
        )
      : undefined;

export const focusOnLink: EditorCommand<Notion.Block> = ({
  block,
  data: selection,
}) => {
  const selectionRange = selection ?? {
    start: 0,
    end: Notion.RTF.getContent(Notion.Block.extractRichText(block)).length,
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
  ({ block }) => {
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
  (block: Notion.Block, childId?: ID): EditorCommand<Notion.Block> =>
  ({ editor }) => {
    const data = "delete-block-command";

    editor.push({
      data,
      type: "update",
      block: Notion.Block.mapRichText(
        Notion.WIP.create({
          type: "paragraph",
          parent: block.parent,
          id: block.id,
        }),
        () => Notion.Block.extractRichText(block),
      ),
      targetBefore: { id: block.id, childId, start: 0, end: 0 },
      targetAfter: { id: block.id, start: 0, end: 0 },
    });
    editor.commit(data);
  };

export const updateBlock =
  (block: Notion.Block): EditorCommand<Notion.Block> =>
  ({ editor }) => {
    const data = "update-block-command";
    const selection = EditorTarget.read(editor);
    const selectionRange = !selection
      ? {
          id: block.id,
          start: 0,
          end: 0,
        }
      : selection;

    editor.push({
      data,
      type: "update",
      block,
      targetAfter:
        selectionRange?.id === block.id
          ? selectionRange
          : {
              start: 0,
              end: 0,
              id: block.id,
            },
      targetBefore: selectionRange ?? undefined,
    });
    editor.commit(data);
  };

export const deleteBlock =
  (id: string, childId?: ID): EditorCommand<Notion.Block> =>
  ({ editor }) => {
    const data = "delete-block-command";

    const block = editor.blocks.find((b) => b.id === id);
    const targetAfter = EditorTarget.tab({ id, childId }, editor, -1);

    if (!block || !targetAfter) return;

    editor.push({
      data,
      type: "remove",
      block,
      targetBefore: { id: block.id, childId, start: 0, end: 0 },
      targetAfter,
    });
    editor.commit(data);
  };

export const toggleToDo =
  (checked?: boolean): EditorCommand<Notion.Block> =>
  ({ block }) => {
    if (block.type !== "to_do") return;
    return {
      ...block,
      to_do: {
        ...block.to_do,
        checked: checked ?? !block.to_do.checked,
      },
    };
  };

export const updateCodeLanguage =
  (language: zNotion.blocks.language): EditorCommand<Notion.Block> =>
  ({ block }) => {
    if (block.type !== "code") return;
    return {
      ...block,
      code: {
        ...block.code,
        language,
      },
    };
  };

export const updateCodeCaption =
  (caption: Notion.RichText): EditorCommand<Notion.Block> =>
  ({ block }) => {
    if (block.type !== "code") return;
    return {
      ...block,
      code: {
        ...block.code,
        caption,
      },
    };
  };

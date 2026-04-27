import { zNotion } from "../../dto/notion/schema/index.js";
import { keys } from "../object.js";
import { create as createTree, flat as flatTree } from "./block-tree.js";
import * as RTF from "./rich-text.js";
import { create } from "./wip.js";

export type BlockType = zNotion.blocks.block["type"];
export type RichTextType = zNotion.blocks.rich_text_type;
export const RichTextType = [
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "heading_4",
  "quote",
  "bulleted_list_item",
  "numbered_list_item",
  "code",
  "callout",
  "toggle",
  "to_do",
] as const;

/** Block restricted to a union type */
export type Block<T extends BlockType = BlockType> = Extract<
  zNotion.blocks.block,
  { type: T }
>;

/** Node restricted to a union type */
export type Node<T extends BlockType = BlockType> = T extends BlockType
  ? Block<T> extends { [i in T]: infer X }
    ? X
    : never
  : never;

/** Block utilities */

export function narrow<T extends BlockType>(
  block: Block,
  ...types: [T, ...T[]]
): block is Extract<Block, { type: T }> {
  for (const type of types) {
    if (block.type === type) return true;
  }
  return false;
}

export function isRichText(
  block: Block,
): block is Block<zNotion.blocks.rich_text_type> {
  return narrow(block, ...RichTextType);
}

export function extract<T extends BlockType>(block: Block<T>): Node<T>;
export function extract(block: Block): Node {
  switch (block.type) {
    case "paragraph":
      return block.paragraph;
    case "heading_1":
      return block.heading_1;
    case "heading_2":
      return block.heading_2;
    case "heading_3":
      return block.heading_3;
    case "heading_4":
      return block.heading_4;
    case "bulleted_list_item":
      return block.bulleted_list_item;
    case "numbered_list_item":
      return block.numbered_list_item;
    case "to_do":
      return block.to_do;
    case "quote":
      return block.quote;
    case "divider":
      return block.divider;
    case "link_to_page":
      return block.link_to_page;
    case "child_page":
      return block.child_page;
    case "image":
      return block.image;
    case "code":
      return block.code;
    case "callout":
      return block.callout;
    case "toggle":
      return block.toggle;
    case "column_list":
      return block.column_list;
    case "column":
      return block.column;
  }
}

export function extractRichText(block: Block) {
  if (!isRichText(block)) return [];
  return extract(block).rich_text;
}

export function map<T extends BlockType>(
  block: Block<T>,
  f: (node: Node<T>) => Node<T>,
): Block<T> {
  switch (block.type) {
    case "paragraph":
      return { ...block, paragraph: f(extract(block)) };
    case "heading_1":
      return { ...block, heading_1: f(extract(block)) };
    case "heading_2":
      return { ...block, heading_2: f(extract(block)) };
    case "heading_3":
      return { ...block, heading_3: f(extract(block)) };
    case "heading_4":
      return { ...block, heading_4: f(extract(block)) };
    case "quote":
      return { ...block, quote: f(extract(block)) };
    case "divider":
      return { ...block, divider: f(extract(block)) };
    case "bulleted_list_item":
      return { ...block, bulleted_list_item: f(extract(block)) };
    case "numbered_list_item":
      return { ...block, numbered_list_item: f(extract(block)) };
    case "to_do":
      return { ...block, to_do: f(extract(block)) };
    case "link_to_page":
      return { ...block, link_to_page: f(extract(block)) };
    case "child_page":
      return { ...block, child_page: f(extract(block)) };
    case "image":
      return { ...block, image: f(extract(block)) };
    case "code":
      return { ...block, code: f(extract(block)) };
    case "callout":
      return { ...block, callout: f(extract(block)) };
    case "toggle":
      return { ...block, toggle: f(extract(block)) };
    case "column_list":
      return { ...block, column_list: f(extract(block)) };
    case "column":
      return { ...block, column: f(extract(block)) };
  }
}

export function mapRichText(
  block: Block,
  f: (rich_text: RTF.RichText) => RTF.RichText,
) {
  if (!isRichText(block)) return block;
  return map(block, (node) => ({
    ...node,
    rich_text: f(extract(block).rich_text),
  }));
}

export function traverse<T extends BlockType>(
  block: Block<T>,
  f: (node: Node<T>) => Promise<Node<T>>,
): Promise<Block<T>> {
  return f(extract(block)).then((node) => map(block, () => node));
}

export function sort(blocks: Block[]): Block[] {
  return flatTree(createTree(blocks));
}

/**
 * Split `Notion.Block` in ltr direction, preserving the current block on the left side.
 * @todo support rtl
 */
export function split(
  block: Block,
  offset: number,
  deleteRange: number = 0,
): {
  left: Block;
  right: Block;
} {
  if (!isRichText(block)) {
    return {
      left: block,
      right: create({
        type: "paragraph",
        parent: block.parent,
      }),
    };
  }

  const rich_text = extractRichText(block);
  const type =
    block.type === "bulleted_list_item" ||
    block.type === "numbered_list_item" ||
    block.type === "to_do"
      ? block.type
      : "paragraph";

  return {
    left: map(block, (node) => ({
      ...node,
      rich_text: RTF.slice(node.rich_text, 0, offset),
    })),
    right: mapRichText(
      create({
        type: type,
        parent: block.parent,
      }),
      () => RTF.slice(rich_text, offset + deleteRange),
    ),
  };
}

export function isAnnotated(
  block: Block,
  annotations: Partial<RTF.Annotations>,
  start: number,
  end: number,
) {
  if (!isRichText(block)) return false;
  const selectedText = RTF.findByRange(extract(block).rich_text, start, end);

  return (
    selectedText.length > 0 &&
    selectedText.every(
      (item) => item.type === "text" && RTF.isItemAnnotated(item, annotations),
    )
  );
}

export function toggleAnnotations(
  block: Block,
  annotations: Partial<RTF.Annotations>,
  start: number,
  end: number,
) {
  if (!isRichText(block) || start === end) return block;

  return mapRichText(block, (rich_text) =>
    RTF.setAnnotations(
      rich_text,
      !isAnnotated(block, annotations, start, end)
        ? annotations
        : (Object.fromEntries(
            keys(annotations).map(
              (a) => [a, RTF.empty_text.annotations[a]] as const,
            ),
          ) satisfies Partial<RTF.Annotations>),
      start,
      end,
    ),
  );
}

export function parentEquals(a: Block["parent"], b: Block["parent"]) {
  return (
    (a.type === "page_id" && b.type === "page_id" && a.page_id === b.page_id) ||
    (a.type === "block_id" &&
      b.type === "block_id" &&
      a.block_id === b.block_id)
  );
}

export function mapMediaURL(
  block: Block,
  f: (url: { url: string }) => { url: string },
): Block {
  if (block.type === "image" && block.image.type === "external") {
    return {
      ...block,
      image: {
        ...block.image,
        external: f(block.image.external),
      },
    };
  }
  if (block.type === "image" && block.image.type === "file") {
    return {
      ...block,
      image: {
        ...block.image,
        file: f(block.image.file),
      },
    };
  }
  return block;
}

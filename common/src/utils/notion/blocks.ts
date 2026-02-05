import { zNotion } from "../../dto/notion/schema/index.js";
import { UnionToTuple } from "../../types/union.js";
import { sliceRichText } from "./rich-text.js";

export function narrowBlock<T extends BlockType>(
  block: Block,
  ...types: [T, ...T[]]
): block is Extract<Block, { type: T }> {
  for (const type of types) {
    if (block.type === type) return true;
  }
  return false;
}

export function extractBlock<T extends BlockType>(
  block: Block<T>,
): UniqueNode<T>;
export function extractBlock(block: Block): Node {
  switch (block.type) {
    case "paragraph":
      return block.paragraph;
    case "heading_1":
      return block.heading_1;
    case "heading_2":
      return block.heading_2;
    case "heading_3":
      return block.heading_3;
    case "bulleted_list_item":
      return block.bulleted_list_item;
    case "numbered_list_item":
      return block.numbered_list_item;
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
  }
}

export function mapBlock<T extends BlockType>(
  block: Block<T>,
  f: (node: UniqueNode<T>) => UniqueNode<T>,
): Block<T> {
  switch (block.type) {
    case "paragraph":
      return { ...block, paragraph: f(extractBlock(block)) };
    case "heading_1":
      return { ...block, heading_1: f(extractBlock(block)) };
    case "heading_2":
      return { ...block, heading_2: f(extractBlock(block)) };
    case "heading_3":
      return { ...block, heading_3: f(extractBlock(block)) };
    case "quote":
      return { ...block, quote: f(extractBlock(block)) };
    case "divider":
      return { ...block, divider: f(extractBlock(block)) };
    case "bulleted_list_item":
      return { ...block, bulleted_list_item: f(extractBlock(block)) };
    case "numbered_list_item":
      return { ...block, numbered_list_item: f(extractBlock(block)) };
    case "link_to_page":
      return { ...block, link_to_page: f(extractBlock(block)) };
    case "child_page":
      return { ...block, child_page: f(extractBlock(block)) };
    case "image":
      return { ...block, image: f(extractBlock(block)) };
  }
}

export function traverseBlock<T extends BlockType>(
  block: Block<T>,
  f: (node: UniqueNode<T>) => Promise<UniqueNode<T>>,
): Promise<Block<T>> {
  return f(extractBlock(block)).then((node) => mapBlock(block, () => node));
}

export function splitBlock(
  block: Block,
  offset: number,
  deleteRange: number = 0,
): {
  left: Block;
  right: Block;
} {
  if (!narrowBlock(block, ...zNotion.blocks.rich_text_type.options)) {
    return {
      left: block,
      right: zNotion.wip.wip_block({ type: "paragraph" }),
    };
  }

  const node = extractBlock(block);

  return {
    left: mapBlock(block, () => ({
      ...node,
      rich_text: sliceRichText(node.rich_text, 0, offset),
    })),
    right: zNotion.wip.wip_block({
      type: "paragraph",
      paragraph: {
        ...node,
        rich_text: sliceRichText(node.rich_text, offset + deleteRange),
      },
    }),
  };
}

/** Utilities */

type BlockType = zNotion.blocks.block["type"];

/** Block restricted to a union type */
type Block<T extends BlockType = BlockType> = Extract<
  zNotion.blocks.block,
  { type: T }
>;

/** Node restricted to a union type */
type Node<T extends BlockType = BlockType> = T extends BlockType
  ? Block<T> extends { [i in T]: infer X }
    ? X
    : never
  : never;

/** Node restricted to a type, but if the resulting type is a union it explodes */
type UniqueNode<T extends BlockType> =
  UnionToTuple<Node<T>> extends [Node<T>] ? Node<T> : never;

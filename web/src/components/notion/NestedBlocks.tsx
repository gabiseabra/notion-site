/**
 * @module @notion-site/web/components/notion/NestedBlocks.ts
 * Notion returns blocks as a flat list with parent references. This module derives a
 * hierarchy by resolving each block’s descendants from the same response set, then
 * produces a top-level render stream where consecutive list items are grouped into
 * list containers (bulleted/numbered).
 */
import { Fragment } from "react";
import * as zN from "@notion-site/common/dto/notion/schema.js";
import { match } from "ts-pattern";
import { Banner } from "../feedback/Banner.js";
import { BlockAnnotations, Text } from "../typography/Text.js";
import { RichText } from "./typography/RichText.js";
import { LinkToPage } from "./navigation/LinkToPage.js";

/**
 * Accepts a flat block array and renders it recursively.
 * Each top-leven block
 * @direction block
 */
export function NestedBlocks({
  blocks,
  indent = 0,
}: { blocks: zN.block[] } & Partial<BlockAnnotations>) {
  return (
    <>
      {getRootBlocks(blocks).map((block) =>
        match(block)
          .with({ type: "paragraph" }, ({ block }) => (
            <Fragment key={block.id}>
              <Block data={block} indent={indent} />

              {block.children.length ? (
                <NestedBlocks blocks={block.children} indent={indent + 1} />
              ) : null}
            </Fragment>
          ))
          .with({ type: "bulleted_list" }, ({ children }) => (
            <ul key={block.id}>
              {children.map((block) => (
                <li key={block.id}>
                  <Block data={block} />

                  {block.children.length ? (
                    <NestedBlocks blocks={block.children} />
                  ) : null}
                </li>
              ))}
            </ul>
          ))
          .with({ type: "numbered_list" }, ({ children }) => (
            <ol key={block.id}>
              {children.map((block) => (
                <li key={block.id}>
                  <Block data={block} />

                  {block.children.length ? (
                    <NestedBlocks blocks={block.children} />
                  ) : null}
                </li>
              ))}
            </ol>
          ))
          .exhaustive(),
      )}
    </>
  );
}

/**
 * Renders a single block node according to its type.
 */
function Block({ data, indent }: { data: zN.block; indent?: number }) {
  return (
    <>
      {match(data)
        .with({ type: "paragraph" }, (data) => (
          <Text as="p" indent={indent} color={data.paragraph.color}>
            <RichText data={data.paragraph.rich_text} />
          </Text>
        ))
        .with({ type: "bulleted_list_item" }, (data) => (
          <Text as="p" indent={indent} color={data.bulleted_list_item.color}>
            <RichText data={data.bulleted_list_item.rich_text} />
          </Text>
        ))
        .with({ type: "numbered_list_item" }, (data) => (
          <Text as="p" indent={indent} color={data.numbered_list_item.color}>
            <RichText data={data.numbered_list_item.rich_text} />
          </Text>
        ))
        .with({ type: "heading_1" }, (data) => (
          <Text as="h2" indent={indent}>
            <RichText data={data.heading_1.rich_text} />
          </Text>
        ))
        .with({ type: "heading_2" }, (data) => (
          <Text as="h3" indent={indent}>
            <RichText data={data.heading_2.rich_text} />
          </Text>
        ))
        .with({ type: "heading_3" }, (data) => (
          <Text as="h4" indent={indent}>
            <RichText data={data.heading_3.rich_text} />
          </Text>
        ))
        .with({ type: "quote" }, (data) => (
          <Text as="blockquote" indent={indent}>
            <RichText data={data.quote.rich_text} />
          </Text>
        ))
        .with({ type: "divider" }, () => <hr />)
        .with({ type: "link_to_page" }, (data) => (
          <LinkToPage id={data.link_to_page.page_id} />
        ))
        .with({ type: "child_page" }, (data) => <LinkToPage id={data.id} />)
        .with({ type: "unsupported_block" }, () => (
          <Banner type="warning" size="m">
            Unsupported block
          </Banner>
        ))
        .exhaustive()}
    </>
  );
}

/** Utilities */

/**
 * Normalised top-level render nodes.
 *
 * Paragraph-like blocks render as standalone nodes, while adjacent list item blocks
 * are grouped into a single list container.
 */
export type RootBlock =
  | {
      id: string;
      type: "paragraph";
      block: NestedBlock;
    }
  | {
      id: string;
      type: "bulleted_list";
      children: Extract<NestedBlock, { type: "bulleted_list_item" }>[];
    }
  | {
      id: string;
      type: "numbered_list";
      children: Extract<NestedBlock, { type: "numbered_list_item" }>[];
    };

/**
 * A Notion block augmented with the descendant blocks present in the same response set.
 */
export type NestedBlock = zN.block & {
  children: zN.block[];
};

/**
 * Builds the top-level render stream from a flat Notion block array.
 */
function getRootBlocks(blocks: zN.block[]) {
  const isNested = blocks.every((block) => block.parent.type === "block_id");

  return blocks
    .filter(({ parent }) =>
      // only include root blocks
      isNested
        ? parent.type === "block_id" &&
          !blocks.some((_block) => _block.id === parent.block_id)
        : parent.type === "page_id",
    )
    .map(mapNestedBlock(blocks))
    .reduce(rootBlockReducer, []);
}

const mapNestedBlock =
  (blocks: zN.block[]) =>
  (block: zN.block): NestedBlock => ({
    ...block,
    // includes all of the deeply nested blocks of children
    children: blocks
      .reduce(
        (acc, block) => {
          const { parent } = block;
          const childBlockIds = acc.map((block) => block.id);
          if (
            parent.type === "block_id" &&
            childBlockIds.includes(parent.block_id)
          ) {
            return [...acc, block];
          } else {
            return acc;
          }
        },
        [block],
      )
      .slice(1),
  });

function rootBlockReducer(acc: RootBlock[], block: NestedBlock): RootBlock[] {
  const previous = acc[acc.length - 1];

  if (block.type === "bulleted_list_item") {
    if (previous && previous.type === "bulleted_list") {
      previous.children.push(block);
      return acc;
    } else {
      return [
        ...acc,
        { id: block.id, type: "bulleted_list", children: [block] },
      ];
    }
  }

  if (block.type === "numbered_list_item") {
    if (previous && previous.type === "numbered_list") {
      previous.children.push(block);
      return acc;
    } else {
      return [
        ...acc,
        { id: block.id, type: "numbered_list", children: [block] },
      ];
    }
  }

  return [...acc, { id: block.id, type: "paragraph", block }];
}

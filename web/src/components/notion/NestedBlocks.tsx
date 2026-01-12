import * as n from "@notion-site/common/dto/notion/schema.js";
import { RichText } from "./RichText.js";
import { match } from "ts-pattern";
import { Fragment } from "react";
import { Banner } from "../feedback/Banner.js";
import { BlockAnnotations } from "../ui/Text.js";

export function NestedBlocks({
  data,
  indent = 0,
}: { data: n.block[] } & Partial<BlockAnnotations>) {
  return (
    <>
      {getRootBlocks(data).map((block) =>
        match(block)
          .with({ type: "paragraph" }, ({ block }) => (
            <Fragment key={block.id}>
              <Block data={block} indent={indent} />

              {block.children.length ? (
                <NestedBlocks data={block.children} indent={indent + 1} />
              ) : null}
            </Fragment>
          ))
          .with({ type: "bulleted_list" }, ({ children }) => (
            <ul key={block.id}>
              {children.map((block) => (
                <li key={block.id}>
                  <Block data={block} />

                  {block.children.length ? (
                    <NestedBlocks data={block.children} />
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
                    <NestedBlocks data={block.children} />
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

function Block({
  data,
  ...props
}: { data: n.block } & Partial<BlockAnnotations>) {
  return (
    <>
      {match(data)
        .with({ type: "paragraph" }, (data) => (
          <RichText as="p" data={data.paragraph.rich_text} {...props} />
        ))
        .with({ type: "bulleted_list_item" }, (data) => (
          <RichText
            as="p"
            data={data.bulleted_list_item.rich_text}
            {...props}
          />
        ))
        .with({ type: "numbered_list_item" }, (data) => (
          <RichText
            as="p"
            data={data.numbered_list_item.rich_text}
            {...props}
          />
        ))
        .with({ type: "heading_1" }, (data) => (
          <RichText as="h2" data={data.heading_1.rich_text} {...props} />
        ))
        .with({ type: "heading_2" }, (data) => (
          <RichText as="h3" data={data.heading_2.rich_text} {...props} />
        ))
        .with({ type: "heading_3" }, (data) => (
          <RichText as="h4" data={data.heading_3.rich_text} {...props} />
        ))
        .with({ type: "quote" }, (data) => (
          <RichText as="blockquote" data={data.quote.rich_text} {...props} />
        ))
        .with({ type: "divider" }, () => <hr />)
        .with({ type: "unsupported_block" }, () => (
          <Banner type="warning">Unsupported block</Banner>
        ))
        .exhaustive()}
    </>
  );
}

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

export type NestedBlock = n.block & {
  children: n.block[];
};

function getRootBlocks(blocks: n.block[]) {
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
  (blocks: n.block[]) =>
  (block: n.block): NestedBlock => ({
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

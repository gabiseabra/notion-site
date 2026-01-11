import * as n from "@notion-site/common/dto/notion/schema.js";
import { RichText } from "./RichText.js";
import { match } from "ts-pattern";
import { Fragment } from "react";
import css from "./Blocks.module.scss";

export function Blocks({ data }: { data: n.block[] }) {
  return (
    <>
      {getRootBlocks(data).map((block) =>
        match(block)
          .with({ type: "paragraph" }, ({ block }) => (
            <Fragment key={block.id}>
              <Block data={block} />

              {block.children.length ? (
                <div className={css.Indentation}>
                  <Blocks data={block.children} />
                </div>
              ) : null}
            </Fragment>
          ))
          .with({ type: "bulleted_list" }, ({ children }) => (
            <ul className={css.BulletedList} key={block.id}>
              {children.map((block) => (
                <li key={block.id}>
                  <Block data={block} />

                  {block.children.length ? (
                    <Blocks data={block.children} />
                  ) : null}
                </li>
              ))}
            </ul>
          ))
          .with({ type: "numbered_list" }, ({ children }) => (
            <ol className={css.NumberedList} key={block.id}>
              {children.map((block) => (
                <li key={block.id}>
                  <Block data={block} />

                  {block.children.length ? (
                    <Blocks data={block.children} />
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

function Block({ data }: { data: n.block }) {
  return (
    <>
      {match(data)
        .with({ type: "paragraph" }, (data) => (
          <RichText
            as="p"
            className={css.Paragraph}
            data={data.paragraph.rich_text}
            color={data.paragraph.color}
          />
        ))
        .with({ type: "bulleted_list_item" }, (data) => (
          <RichText
            as="p"
            className={css.Paragraph}
            data={data.bulleted_list_item.rich_text}
            color={data.bulleted_list_item.color}
          />
        ))
        .with({ type: "numbered_list_item" }, (data) => (
          <RichText
            as="p"
            className={css.Paragraph}
            data={data.numbered_list_item.rich_text}
            color={data.numbered_list_item.color}
          />
        ))
        .with({ type: "heading_1" }, (data) => (
          <RichText
            as="h2"
            className={css.Heading}
            data={data.heading_1.rich_text}
            color={data.heading_1.color}
          />
        ))
        .with({ type: "heading_2" }, (data) => (
          <RichText
            as="h3"
            className={css.Heading}
            data={data.heading_2.rich_text}
            color={data.heading_2.color}
          />
        ))
        .with({ type: "heading_3" }, (data) => (
          <RichText
            as="h4"
            className={css.Heading}
            data={data.heading_3.rich_text}
            color={data.heading_3.color}
          />
        ))
        .with({ type: "quote" }, (data) => (
          <RichText
            as="blockquote"
            className={css.Blockquote}
            data={data.quote.rich_text}
            color={data.quote.color}
          />
        ))
        .with({ type: "divider" }, () => <hr className={css.Divider} />)
        .with({ type: "unsupported_block" }, () => <div>unsupported block</div>)
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

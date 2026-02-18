/**
 * Notion returns blocks as a flat list with parent references. This module derives a
 * hierarchy by resolving each block’s descendants from the same response set, then
 * produces a top-level render stream where consecutive list items are grouped into
 * list containers (bulleted/numbered).
 */
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Fragment, ReactNode } from "react";
import { match } from "ts-pattern";
import { Block } from "./Block.js";

type RootBlockProps = {
  value: Notion.Block[];
  render?: (block: Notion.Block, path: BlockPath) => ReactNode;
  path?: BlockPath;
};

/**
 * Accepts a flat block array and renders it recursively.
 * @direction block
 */
export function RootBlock({
  value,
  render = (block, { indent }) => <Block value={block} indent={indent} />,
  path = new BlockPath(),
}: RootBlockProps) {
  return (
    <>
      {getRootBlocks(value).map((block) =>
        match(block)
          .with({ type: "paragraph" }, ({ block }) => (
            <Fragment key={block.id}>
              {render(block, path)}

              {block.children.length ? (
                <RootBlock
                  value={block.children}
                  render={render}
                  path={path.concat(block)}
                />
              ) : null}
            </Fragment>
          ))
          .with({ type: "bulleted_list" }, ({ children }) => (
            <ul key={block.id}>
              {children.map((block) => (
                <li key={block.id}>
                  {render(block, path)}

                  {block.children.length ? (
                    <RootBlock
                      value={block.children}
                      render={render}
                      path={path.concat(block)}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ))
          .with({ type: "numbered_list" }, ({ children }) => (
            <ol key={block.id}>
              {children.map((block) => (
                <li key={block.id}>
                  {render(block, path)}

                  {block.children.length ? (
                    <RootBlock
                      value={block.children}
                      render={render}
                      path={path.concat(block)}
                    />
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
export type NestedBlock = Notion.Block & {
  children: Notion.Block[];
};

/**
 * Builds the top-level render stream from a flat Notion block array.
 */
function getRootBlocks(blocks: Notion.Block[]) {
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
  (blocks: Notion.Block[]) =>
  (block: Notion.Block): NestedBlock => ({
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

export class BlockPath extends Array<Notion.Block> {
  /**
   * Get the visual indent level of the block who has this path.
   */
  get indent() {
    return this.filter(
      (block) =>
        block.type !== "bulleted_list_item" &&
        block.type !== "numbered_list_item",
    ).length;
  }

  concat(...items: (Notion.Block | ConcatArray<Notion.Block>)[]): BlockPath {
    return new BlockPath(...super.concat(...items));
  }

  append(block: Notion.Block): BlockPath {
    return new BlockPath(...this, block);
  }
}

/**
 * Notion returns blocks as a flat list with parent references. This module:
 * 1. Derives descendants for each block from the same response set.
 * 2. Builds a top-level render stream that groups adjacent list items.
 * 3. Renders recursively with stable keys and indentation.
 */
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Fragment, ReactNode } from "react";
import { match } from "ts-pattern";
import { Accordion } from "../display/Accordion.js";
import { Block } from "./Block.js";

type RootBlockProps = {
  value: Notion.Block[];
  /**
   * Custom render hook for a single block. Receives the block and its path.
   * Use `path.indent` to align with list/toggle nesting.
   */
  render?: (block: Notion.Block, path: BlockPath) => ReactNode;
  /** Path of ancestors for the current render subtree. */
  path?: BlockPath;
};

/** Accepts a flat block array and renders it recursively. */
export function RootBlock({
  value,
  render = (block, { indent }) => <Block value={block} indent={indent} />,
  path = new BlockPath(),
}: RootBlockProps) {
  return (
    <>
      {getRootBlocks(value).map((rootBlock) =>
        match(rootBlock)
          .with({ type: "block" }, ({ block }) => (
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
            <ul key={rootBlock.id}>
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
            <ol key={rootBlock.id}>
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
          .with({ type: "toggle" }, ({ id, toggle, children }) => (
            <Accordion key={id} summary={render(toggle, path)}>
              <RootBlock
                value={children}
                render={render}
                path={path.concat(toggle)}
              />
            </Accordion>
          ))
          .exhaustive(),
      )}
    </>
  );
}

/** Utilities */

/** Normalised render nodes used by `RootBlock`. */
export type RootBlock =
  | {
      id: string;
      type: "block";
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
    }
  | {
      id: string;
      type: "toggle";
      toggle: Notion.Block.Block<"toggle">;
      children: Notion.Block[];
    };

/**
 * A Notion block augmented with descendants present in the same response set.
 * `children` includes direct and deep descendants in flat order.
 */
export type NestedBlock = Notion.Block & {
  children: Notion.Block[];
};

/**
 * Builds the top-level render stream from a flat Notion block array.
 *
 * If all items are nested (`parent.type === "block_id"`), we treat blocks whose
 * parent is not in the current set as the local roots for this subtree.
 */
function getRootBlocks(blocks: Notion.Block[]) {
  return getLocalRoots(blocks)
    .map(attachDescendants(blocks))
    .reduce(foldRootBlocks, []);
}

/**
 * Returns the root blocks for the current render pass.
 * - If all blocks are nested (`parent.type === "block_id"`), roots are those
 *   whose parent is not present in the current set.
 * - Otherwise, roots are the page-level blocks (`parent.type === "page_id"`).
 */
function getLocalRoots(blocks: Notion.Block[]) {
  const isNested = blocks.every((block) => block.parent.type === "block_id");

  return blocks.filter(({ parent }) =>
    isNested
      ? parent.type === "block_id" &&
        !blocks.some((block) => block.id === parent.block_id)
      : parent.type === "page_id",
  );
}

/**
 * Attaches a flat list of descendants to each block by following parent links.
 * The result is a preorder-like list that preserves the original response order.
 */
const attachDescendants =
  (blocks: Notion.Block[]) =>
  (block: Notion.Block): NestedBlock => ({
    ...block,
    children: blocks
      .reduce(
        (acc, childBlock) => {
          // Step 1: Track the ids already collected in this chain.
          const { parent } = childBlock;
          const childBlockIds = acc.map((block) => block.id);
          // Step 2: If the current block's parent is in the chain,
          // it's a descendant and should be appended.
          if (
            parent.type === "block_id" &&
            childBlockIds.includes(parent.block_id)
          ) {
            return [...acc, childBlock];
          } else {
            return acc;
          }
        },
        // Seed with the root block so descendants can match it.
        [block],
      )
      // Drop the seed so `children` only contains descendants.
      .slice(1),
  });

/**
 * Folds a flat stream of `NestedBlock` into the `RootBlock[]` shape.
 * Order is preserved. The accumulator is mutated only when appending to an
 * existing list group.
 */
function foldRootBlocks(acc: RootBlock[], block: NestedBlock): RootBlock[] {
  const previous = acc[acc.length - 1];

  switch (block.type) {
    case "bulleted_list_item":
      if (previous && previous.type === "bulleted_list") {
        previous.children.push(block);
        return acc;
      } else {
        return [
          ...acc,
          { id: block.id, type: "bulleted_list", children: [block] },
        ];
      }

    case "numbered_list_item":
      if (previous && previous.type === "numbered_list") {
        previous.children.push(block);
        return acc;
      } else {
        return [
          ...acc,
          { id: block.id, type: "numbered_list", children: [block] },
        ];
      }

    case "toggle":
      return [
        ...acc,
        {
          id: block.id,
          type: "toggle",
          toggle: block,
          children: block.children,
        },
      ];
  }

  // Step 2: Default case for paragraph-like nodes.
  return [...acc, { id: block.id, type: "block", block }];
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

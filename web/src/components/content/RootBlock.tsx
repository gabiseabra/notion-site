/**
 * Notion returns blocks as a flat list with parent references. This module:
 * 1. Derives descendants for each block from the same response set.
 * 2. Builds a top-level render stream that groups adjacent list items.
 * 3. Renders recursively with stable keys and indentation.
 */
import { isNonNullable } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Fragment, ReactNode } from "react";
import { match } from "ts-pattern";
import { GalleryProvider } from "../display/Gallery";
import { Block } from "./Block.js";

type RootBlockProps = {
  value: Notion.Block[];
  /**
   * Custom render hook for a single block. Receives the block and its path.
   * Use `path.indent` to align with list/toggle nesting.
   */
  render?: (
    children: ReactNode,
    block: Notion.Block,
    path: Notion.Block[],
  ) => ReactNode;
};

/** Accepts a flat block array and renders it recursively. */
export function RootBlock({
  value,
  render = (children, block) => <Block value={block}>{children}</Block>,
}: RootBlockProps) {
  return (
    <GalleryProvider>
      {Notion.BlockTree.map<ReactNode>(
        Notion.BlockTree.create(value),
        (children, block, path) => (
          <Fragment key={block.id}>{render(children, block, path)}</Fragment>
        ),
        (children, branch) =>
          match(branch)
            .with({ type: "block" }, () => children)
            .with({ type: "bulleted_list" }, ({ id }) => (
              <ul key={id}>{children}</ul>
            ))
            .with({ type: "numbered_list" }, ({ id, children: items }) => (
              <ol
                key={id}
                start={items
                  .map((item) => item.numbered_list_item.list_start_index)
                  .find(isNonNullable)}
              >
                {children}
              </ol>
            ))
            .exhaustive(),
      )}
    </GalleryProvider>
  );
}

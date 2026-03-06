import { Block } from "./block.js";

export type BlockTree = RootBlock[];

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
    };

/**
 * A Notion block augmented with descendants present in the same response set.
 * `children` includes direct and deep descendants in flat order.
 */
export type NestedBlock = Block & {
  children: Block[];
};

export function create(blocks: Block[], rootId?: string): BlockTree {
  return blocks
    .filter(filterLocalRoots(rootId))
    .map(attachDescendants(blocks))
    .reduce(foldRootBlocks, []);
}

export function flat(tree: BlockTree): Block[] {
  return map<Block[]>(
    tree,
    (acc, block) => [block, ...acc.flat()],
    (acc) => acc.flat(),
  ).flat();
}

export function map<TBranch, TLeaf = TBranch>(
  tree: BlockTree,
  leafF: (acc: TBranch[], block: NestedBlock, path: Block[]) => TLeaf,
  branchF: (acc: TLeaf[], node: RootBlock, path: Block[]) => TBranch,
  path: Block[] = [],
): TBranch[] {
  return tree.map((branch) => {
    switch (branch.type) {
      case "block": {
        const block = branch.block;
        return branchF(
          [
            leafF(
              map(
                create(block.children, block.id),
                leafF,
                branchF,
                path.concat(block),
              ),
              block,
              path,
            ),
          ],
          branch,
          path,
        );
      }

      case "bulleted_list":
      case "numbered_list":
        return branchF(
          branch.children.map((block) =>
            leafF(
              map(
                create(block.children, block.id),
                leafF,
                branchF,
                path.concat(block),
              ),
              block,
              path,
            ),
          ),
          branch,
          path,
        );
    }
  });
}

/** Filter blocks in that are children of rootId.
 */
const filterLocalRoots =
  (rootId?: string) =>
  ({ parent }: Block) =>
    rootId
      ? parent.type === "block_id" && parent.block_id === rootId
      : parent.type === "page_id";

/** Creates Block -> NestedBlock by attaching nested children found in the given
 * blocks array.
 */
const attachDescendants =
  (blocks: Block[]) =>
  (block: Block): NestedBlock => ({
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

/** Groups NestedBlock[] into BlockTree.
 */
function foldRootBlocks(acc: BlockTree, block: NestedBlock): BlockTree {
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
  }

  // Step 2: Default case for paragraph-like nodes.
  return [...acc, { id: block.id, type: "block", block }];
}

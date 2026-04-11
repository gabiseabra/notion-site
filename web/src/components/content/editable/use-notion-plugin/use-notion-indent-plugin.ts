import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { SelectionRange } from "../../../../utils/selection-range.js";
import { ContentEditorPlugin } from "../types.js";

export const useNotionIndentPlugin =
  ({
    maxDepth = 4,
  }: {
    maxDepth?: number;
  }): ContentEditorPlugin<Notion.Block> =>
  (editor) => {
    const getParent = (block: Notion.Block, depth = 0) => {
      if (depth < 0) return block;
      if (block.parent.type === "page_id") return undefined;
      const parent = editor.blocks.find(
        hasPropertyValue("id", block.parent.block_id),
      );
      if (!parent || !depth) return parent;
      return getParent(parent, depth - 1);
    };

    const getPrevious = (block: Notion.Block) => {
      const siblings = editor.blocks.filter((b) =>
        Notion.Block.parentEquals(block.parent, b.parent),
      );
      const index = siblings.findIndex(hasPropertyValue("id", block.id));
      return index > 0 ? siblings[index - 1] : undefined;
    };

    const getIndent = (block: Notion.Block) => {
      for (
        let i = 0, b: Notion.Block | undefined = block;
        b;
        b = getParent(b), i++
      ) {
        if (b.parent.type === "page_id") return i;
      }
      return 0;
    };

    const shift = (block: Notion.Block) => {
      const previous = getPrevious(block);
      const currentParent = getParent(block);
      const targetParent =
        previous &&
        getParent(previous, getIndent(previous) - (getIndent(block) + 1));

      if (!targetParent || targetParent === currentParent) return undefined;

      return {
        type: "block_id",
        block_id: targetParent.id,
      } as const;
    };

    const unshift = (block: Notion.Block) => {
      const grandParent = getParent(block, 1);
      if (!grandParent) return { type: "page_id", page_id: "" } as const;
      return {
        type: "block_id",
        block_id: grandParent.id,
      } as const;
    };

    return (block) => ({
      onKeyDown(e) {
        const selection = SelectionRange.read(e.currentTarget) ?? undefined;

        if (!selection) return;

        if (e.key === "Tab" && getIndent(block) < maxDepth) {
          const parent = shift(block);

          if (parent) {
            const data = "notion-indent-plugin";

            editor.push({
              data,
              type: "apply",
              actions: [
                {
                  type: "update",
                  block: { ...(editor.peek(block.id) ?? block), parent },
                },
                ...editor.blocks.flatMap((b) => {
                  if (
                    b.parent.type === "block_id" &&
                    b.parent.block_id === block.id
                  ) {
                    return [
                      { type: "update", block: { ...b, parent } },
                    ] as const;
                  }
                  return [];
                }),
              ],
              targetBefore: { id: block.id, ...selection },
              targetAfter: { id: block.id, ...selection },
            });
            editor.commit(data);
          }

          e.preventDefault();
        }

        if (
          e.key === "Backspace" &&
          selection &&
          selection.start === 0 &&
          selection.end === 0 &&
          getIndent(block) > 0
        ) {
          const newParent = unshift(block);
          const data = "notion-indent-plugin";
          const ix = editor.blocks.findIndex((b) => b.id === block.id);

          editor.push({
            data,
            type: "apply",
            actions: [
              {
                type: "update",
                block: {
                  ...(editor.peek(block.id) ?? block),
                  parent: newParent,
                },
              },

              ...editor.blocks.slice(ix + 1).flatMap((b) => {
                if (!Notion.Block.parentEquals(block.parent, b.parent))
                  return [];
                return [
                  {
                    type: "update",
                    block: {
                      ...b,
                      parent: { type: "block_id", block_id: block.id },
                    },
                  },
                ] as const;
              }),
            ],
            targetBefore: { id: block.id, ...selection },
            targetAfter: { id: block.id, ...selection },
          });
          editor.commit(data);

          e.preventDefault();
          e.stopPropagation();
        }

        if (e.key === "Tab") {
          e.preventDefault();
        }
      },
    });
  };

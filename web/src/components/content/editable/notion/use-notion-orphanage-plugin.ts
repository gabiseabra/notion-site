import { Notion } from "@notion-site/common/utils/notion/index.js";
import { useEventListener } from "../../../../hooks/use-event-listener.js";
import { ContentEditorPlugin } from "../types.js";
import { useBlockMutationPlugin } from "../use-block-mutation-plugin.js";

export const useNotionOrphanagePlugin: ContentEditorPlugin<Notion.Block> = (
  editor,
) => {
  useEventListener(editor.bus, "commit", (event) => {
    // transfer children to parent's parent when a block is deleted
    if (event.detail.data instanceof useBlockMutationPlugin.MergeData) {
      const deleted = event.detail.data.right;

      event.detail.blocks.forEach((block) => {
        if (
          block.parent.type === "block_id" &&
          block.parent.block_id === deleted.id
        )
          block.parent = deleted.parent;
      });
    }
    // transfer children to the right side block when u split
    if (event.detail.data instanceof useBlockMutationPlugin.SplitData) {
      const original = event.detail.data.left;
      const created = event.detail.data.right;

      event.detail.blocks.forEach((block) => {
        if (
          block.parent.type === "block_id" &&
          block.parent.block_id === original.id
        )
          block.parent = { type: "block_id", block_id: created.id };
      });
    }

    event.detail.blocks = Notion.Block.sort(event.detail.blocks);
  });

  return () => ({});
};

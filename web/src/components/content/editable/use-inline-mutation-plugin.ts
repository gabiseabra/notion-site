import { SelectionRange } from "../../../utils/selection-range.js";
import { SpliceRange } from "../../../utils/splice-range.js";
import { AnyBlock } from "../editor/types.js";
import { useDebouncedEditorChangeset } from "../editor/use-editor-changeset.js";
import { createEventListenerPlugin } from "./create-event-listener-plugin.js";
import { ContentEditorPlugin } from "./types.js";

/**
 * Plugin that handles text input, preserving rich_text formatting.
 *
 * Uses native `beforeinput` to get inputType (React's synthetic event lacks it).
 */
export const useInlineMutationPlugin = <TBlock extends AnyBlock>({
  multiLine,
  debounceMs = 200,
  splice,
}: {
  multiLine?: boolean;
  debounceMs?: number | false;
  splice: (
    block: TBlock,
    offset: number,
    deleteCount: number,
    insert: string,
  ) => TBlock;
}): ContentEditorPlugin<TBlock> =>
  createEventListenerPlugin("beforeinput", (editor) => {
    const changeset = useDebouncedEditorChangeset(editor, debounceMs);

    return (block) => (e) => {
      if (!(e.target instanceof HTMLElement)) return;

      const currentBlock = changeset.peek(block.id);
      const actualSelection = SelectionRange.read(e.target);

      if (!actualSelection || !currentBlock) return;

      const selectionBefore = changeset.selectionAfter ?? actualSelection;
      const spliceRange = SpliceRange.fromInputEvent(
        e,
        e.target.textContent ?? "",
        selectionBefore,
      );

      if (!spliceRange) return;

      // skip newline if multiline is disabled
      if (spliceRange.insert === "\n" && !multiLine) {
        e.preventDefault();
        return;
      }

      changeset.push({
        type: "update",
        block: splice(
          currentBlock,
          spliceRange.offset,
          spliceRange.deleteCount,
          spliceRange.insert,
        ),
        selectionBefore,
        selectionAfter: SpliceRange.toSelectionRange(spliceRange, 1),
      });
    };
  });

import { SelectionRange } from "../../../utils/selection-range.js";
import { SpliceRange } from "../../../utils/splice-range.js";
import { AnyBlock } from "../editor/types.js";
import { usePendingChanges } from "../editor/use-pending-changes";
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
    const pendingChanges = usePendingChanges({
      editor,
      debounceMs,
    });

    return (block) => (e) => {
      try {
        if (!(e.target instanceof HTMLElement)) return;

        const currentBlock = editor.peek(block.id);
        const actualSelection = SelectionRange.read(e.target);

        if (!actualSelection || !currentBlock) return;

        const pending = pendingChanges.begin({
          block: currentBlock,
          data: new useInlineMutationPlugin.FlushData(),
          selectionBefore: actualSelection,
          selectionAfter: actualSelection,
        });

        const spliceRange = SpliceRange.fromInputEvent(
          e,
          e.target.textContent ?? "",
          pending.selectionAfter,
        );

        if (!spliceRange) return;

        // skip newline if multiline is disabled
        if (spliceRange.insert === "\n" && !multiLine) {
          e.preventDefault();
          return;
        }

        pendingChanges.update({
          block: splice(
            currentBlock,
            spliceRange.offset,
            spliceRange.deleteCount,
            spliceRange.insert,
          ),
          data: new useInlineMutationPlugin.SpliceData(
            currentBlock,
            spliceRange.offset,
            spliceRange.deleteCount,
            spliceRange.insert,
          ),
          selectionAfter: SpliceRange.toSelectionRange(spliceRange, 1),
        });
      } finally {
        pendingChanges.schedule();
      }
    };
  });

useInlineMutationPlugin.SpliceData = class InlineMutationSplice<
  TBlock extends AnyBlock,
> {
  constructor(
    public block: TBlock,
    public offset: number,
    public deleteCount: number,
    public insert: string,
  ) {}
};

useInlineMutationPlugin.FlushData = class InlineMutationFlush {};

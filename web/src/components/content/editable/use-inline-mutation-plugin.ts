import { useRef } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Slot } from "../../../utils/slot";
import { SpliceRange } from "../../../utils/splice-range.js";
import { AnyBlock, ContentEditor } from "../editor/types.js";
import { useDebouncedEditorChangeset } from "../editor/use-editor-changeset.js";
import { composePlugins } from "./compose-plugins";
import { createEventListenerPlugin } from "./create-event-listener-plugin.js";
import { ContentEditorPlugin } from "./types.js";

export const useInlineMutationPlugin = <TBlock extends AnyBlock>({
  multiLine,
  debounceMs = 200,
  splice,
  change,
  batchingDisabled = (id, editor) =>
    editor.ref(id) instanceof HTMLInputElement ||
    editor.ref(id) instanceof HTMLTextAreaElement,
}: {
  batchingDisabled?: DisabledSlot<TBlock>;
  multiLine?: boolean;
  debounceMs?: number | false;
  splice: Splice<TBlock>;
  change: Change<TBlock>;
}) =>
  composePlugins<TBlock>(
    useBatchedInlineMutationPlugin({
      multiLine,
      debounceMs,
      splice,
      disabled: batchingDisabled,
    }),
    useSyncInlineMutationPlugin({
      multiLine,
      change,
      disabled: (id, editor) => !Slot.extract(batchingDisabled, id, editor),
    }),
  );

export const useSyncInlineMutationPlugin =
  <TBlock extends AnyBlock>({
    disabled,
    multiLine,
    change,
  }: {
    disabled?: DisabledSlot<TBlock>;
    multiLine?: boolean;
    change: Change<TBlock>;
  }): ContentEditorPlugin<TBlock> =>
  (editor) => {
    const selectionBeforeRef = useRef<SelectionRange>(null);

    return (block) => ({
      onBeforeInput(event) {
        selectionBeforeRef.current = SelectionRange.read(event.currentTarget);
      },
      onInput(event) {
        if (Slot.extract(disabled, block.id, editor)) return;
        if (
          !(
            event.currentTarget instanceof HTMLInputElement ||
            event.currentTarget instanceof HTMLTextAreaElement
          )
        )
          return;

        if (
          (event.nativeEvent.inputType === "insertLineBreak" ||
            event.nativeEvent.inputType === "insertParagraph") &&
          !multiLine
        ) {
          event.preventDefault();
          return;
        }

        const data = new useSyncInlineMutationPlugin.ChangeData();
        editor.push({
          data,
          type: "update",
          block: change(block, event.currentTarget.value),
          selectionBefore: selectionBeforeRef.current ?? undefined,
          selectionAfter: SelectionRange.read(event.currentTarget) ?? undefined,
        });
      },
    });
  };

useSyncInlineMutationPlugin.ChangeData = class SyncInlineMutationChangeData {};

/**
 * Plugin that handles text input by handling the native `beforeinput` in batched mode.
 *
 * This is appropriate for contenteditable elements,
 * where commits causes the whole inline stack to be thrashed,
 * and the element to lose selection.
 * For this reason, inline edits need to be batched.
 */
export const useBatchedInlineMutationPlugin = <TBlock extends AnyBlock>({
  disabled,
  multiLine,
  debounceMs = 200,
  splice,
}: {
  disabled?: DisabledSlot<TBlock>;
  multiLine?: boolean;
  debounceMs?: number | false;
  splice: Splice<TBlock>;
}): ContentEditorPlugin<TBlock> =>
  createEventListenerPlugin("beforeinput", (editor) => {
    const changeset = useDebouncedEditorChangeset(editor, debounceMs);

    return (block) => (e) => {
      if (Slot.extract(disabled, block.id, editor)) return;
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

export type Splice<TBlock> = (
  block: TBlock,
  offset: number,
  deleteCount: number,
  insert: string,
) => TBlock;

export type Change<TBlock> = (block: TBlock, insert: string) => TBlock;

type DisabledSlot<TBlock extends AnyBlock> = Slot<
  TBlock["id"],
  boolean,
  [ContentEditor<TBlock>]
>;

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
  update = (b) => b,
}: {
  multiLine?: boolean;
  debounceMs?: number | false;
  splice: Splice<TBlock>;
  /** If present, prefer reacting to onChange event when the target is a input
   * or textarea element */
  update?: Update<TBlock>;
}) => {
  const method = (id: TBlock["id"], editor: ContentEditor<TBlock>) =>
    !!update &&
    (editor.ref(id) instanceof HTMLInputElement ||
      editor.ref(id) instanceof HTMLTextAreaElement)
      ? ("update" as const)
      : ("splice" as const);

  return composePlugins<TBlock>(
    useSpliceInlineMutationPlugin({
      multiLine,
      debounceMs,
      splice,
      disabled: Slot.map(method, (method) => method !== "splice"),
    }),
    useUpdateInlineMutationPlugin({
      multiLine,
      update,
      disabled: Slot.map(method, (method) => method !== "update"),
    }),
  );
};

export const useUpdateInlineMutationPlugin =
  <TBlock extends AnyBlock>({
    disabled,
    multiLine,
    update,
  }: {
    disabled?: DisabledSlot<TBlock>;
    multiLine?: boolean;
    update: Update<TBlock>;
  }): ContentEditorPlugin<TBlock> =>
  (editor) => {
    const selectionBeforeRef = useRef<SelectionRange>(null);

    return (block) => ({
      onBeforeInput(event) {
        selectionBeforeRef.current = SelectionRange.read(event.currentTarget);
      },
      onInput(event) {
        if (
          Slot.extract(disabled, block.id, editor) ||
          !(
            event.currentTarget instanceof HTMLInputElement ||
            event.currentTarget instanceof HTMLTextAreaElement
          ) ||
          (!multiLine &&
            (event.nativeEvent.inputType === "insertParagraph" ||
              event.nativeEvent.inputType === "insertNewLine"))
        )
          return;

        editor.push({
          data: new useUpdateInlineMutationPlugin.ChangeData(),
          type: "update",
          block: update(block, event.currentTarget.value),
          selectionBefore: selectionBeforeRef.current ?? undefined,
          selectionAfter: SelectionRange.read(event.currentTarget) ?? undefined,
        });
      },
    });
  };

useUpdateInlineMutationPlugin.ChangeData = class SyncInlineMutationChangeData {};

/**
 * Plugin that handles text input by handling the native `beforeinput` in batched mode.
 *
 * This is appropriate for contenteditable elements,
 * where commits causes the whole inline stack to be thrashed,
 * and the element to lose selection.
 * For this reason, inline edits need to be batched.
 */
export const useSpliceInlineMutationPlugin = <TBlock extends AnyBlock>({
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

export type Update<TBlock> = (block: TBlock, value: string) => TBlock;

type DisabledSlot<TBlock extends AnyBlock> = Slot<
  boolean,
  TBlock["id"],
  [ContentEditor<TBlock>]
>;

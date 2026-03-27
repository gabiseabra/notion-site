import { useRef } from "react";
import { SelectionRange } from "../../../utils/selection-range.js";
import { Slot } from "../../../utils/slot";
import { SpliceRange } from "../../../utils/splice-range.js";
import { AnyBlock, ContentEditor } from "../editor/types.js";
import { useDebouncedEditorChangeset } from "../editor/use-editor-changeset.js";
import { composePlugins } from "./compose-plugins";
import { createEventListenerPlugin } from "./create-event-listener-plugin.js";
import { ContentEditorPlugin } from "./types.js";

/**
 * Plugin that handles text input for both contenteditable and input/textarea elements.
 *
 * Dispatches to one of two strategies based on the element type:
 * - `useUpdateInlineMutationPlugin` — for `<input>` and `<textarea>` elements,
 *   when an `update` function is provided.
 * - `useSpliceInlineMutationPlugin` — for contenteditable elements (or when no
 *   `update` function is provided).
 */
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
    (editor.ref(id).element instanceof HTMLInputElement ||
      editor.ref(id).element instanceof HTMLTextAreaElement)
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

/**
 * Plugin that handles text input for `<input>` and `<textarea>` elements.
 *
 * Reacts to the `onInput` event and replaces the block's content with the
 * element's full current value via the `update` callback.
 */
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
 * Plugin that handles text input via the native `beforeinput` in batched mode.
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

/** Applies a partial text mutation to a block by offset, delete count, and inserted string. */
export type Splice<TBlock> = (
  block: TBlock,
  offset: number,
  deleteCount: number,
  insert: string,
) => TBlock;

/** Replaces a block's content with a new full string value. */
export type Update<TBlock> = (block: TBlock, value: string) => TBlock;

type DisabledSlot<TBlock extends AnyBlock> = Slot<
  boolean,
  TBlock["id"],
  [ContentEditor<TBlock>]
>;

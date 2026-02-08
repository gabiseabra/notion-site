import type { Selection } from "./selection.js";

/**
 * Did the event originate inside an element matching selector that is within the element handling the event?
 */
export function isEventFromMatchingDescendant(
  { target, currentTarget }: Pick<Event, "target" | "currentTarget">,
  selector: string,
) {
  return (
    currentTarget instanceof Element &&
    target instanceof Element &&
    currentTarget.contains(target.closest(selector))
  );
}

/**
 * Did the event originate inside the given element?
 */
export function isEventFromElement(
  { target }: Pick<Event, "target">,
  element: Element,
) {
  return target instanceof Element && element.contains(target);
}

export type SpliceParams = {
  offset: number;
  deleteCount: number;
  insert: string;
};

/**
 * Given an InputEvent, current text content, and selection,
 * returns the splice parameters to apply that input.
 *
 * Returns null if the event doesn't result in a text change.
 *
 * Matches the logic in plain-text.ts plugin.
 */
export function getInputEventSpliceParams(
  event: InputEvent,
  selection: Selection,
): SpliceParams | null {
  const { inputType, data } = event;
  const { start, end } = selection;
  const selectionLength = end !== null ? end - start : 0;

  switch (inputType) {
    // Insertion
    case "insertText":
    case "insertFromPaste":
    case "insertFromDrop":
    case "insertReplacementText": {
      return {
        offset: start,
        deleteCount: selectionLength,
        insert: data ?? "",
      };
    }

    // Backward deletion (backspace, word, line)
    case "deleteContentBackward":
    case "deleteWordBackward":
    case "deleteSoftLineBackward": {
      const deleteCount = selectionLength > 0 ? selectionLength : 1;
      const offset = selectionLength > 0 ? start : start - 1;
      if (offset >= 0) {
        return { offset, deleteCount, insert: "" };
      }
      return null;
    }

    // Forward deletion (delete, word, line)
    case "deleteContentForward":
    case "deleteWordForward":
    case "deleteSoftLineForward": {
      return {
        offset: start,
        deleteCount: selectionLength > 0 ? selectionLength : 1,
        insert: "",
      };
    }

    // Cut
    case "deleteByCut": {
      if (selectionLength > 0) {
        return { offset: start, deleteCount: selectionLength, insert: "" };
      }
      return null;
    }

    case "insertLineBreak":
      return { offset: start, deleteCount: selectionLength, insert: "\n" };

    default:
      return null;
  }
}

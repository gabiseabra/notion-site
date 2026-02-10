import { Element } from "./element.js";
import { SelectionRange } from "./selection-range.js";

export type SpliceRange = {
  offset: number;
  deleteCount: number;
  insert: string;
};

export const SpliceRange = {
  applyToElement,

  apply(text: string, { offset, deleteCount, insert }: SpliceRange) {
    const chars = [...text];
    chars.splice(offset, deleteCount, insert);
    return chars.join("");
  },

  fromSelectionRange({ start, end }: SelectionRange): SpliceRange {
    return {
      offset: start,
      deleteCount: Math.max(0, end - start),
      insert: "",
    };
  },

  toSelectionRange(splice: SpliceRange, direction: 1 | -1) {
    const start =
      direction === 1
        ? splice.offset + splice.insert.length
        : splice.offset + splice.deleteCount;

    return { start, end: start };
  },

  fromInputEvent(
    event: InputEvent,
    text: string,
    selection: SelectionRange,
  ): SpliceRange | null {
    const selected = SpliceRange.fromSelectionRange(selection);

    switch (event.inputType) {
      case "insertText":
      case "insertFromPaste":
      case "insertFromDrop":
      case "insertReplacementText":
        return insertAtSelection(selection, selected, event.data ?? "");

      case "insertLineBreak":
        return insertAtSelection(selection, selected, "\n");

      case "deleteByCut":
        return selected;

      case "deleteContentBackward":
        return deleteFromCaret(text, selection, -1, "char");

      case "deleteContentForward":
        return deleteFromCaret(text, selection, 1, "char");

      case "deleteWordBackward":
        return deleteFromCaret(text, selection, -1, "word");

      case "deleteWordForward":
        return deleteFromCaret(text, selection, 1, "word");

      case "deleteSoftLineBackward":
        return deleteFromCaret(text, selection, -1, "softLine");

      case "deleteSoftLineForward":
        return deleteFromCaret(text, selection, 1, "softLine");

      default:
        return null;
    }
  },
};

type Unit = "char" | "word" | "softLine";

const WORD_CHAR = /[\p{L}\p{N}_]/u;
const WHITESPACE = /\s/;

function insertAtSelection(
  selection: SelectionRange,
  selected: SpliceRange,
  insert: string,
): SpliceRange {
  return {
    offset: selection.start,
    deleteCount: selected?.deleteCount,
    insert,
  };
}

function deleteFromCaret(
  text: string,
  selection: SelectionRange,
  direction: 1 | -1,
  unit: Unit,
): SpliceRange | null {
  const selected = SpliceRange.fromSelectionRange(selection);
  if (selected.deleteCount > 0) return selected;

  switch (unit) {
    case "char":
      return getCharDeleteSpan(text, selection.start, direction);
    case "word":
      return getWordDeleteSpan(text, selection.start, direction);
    case "softLine":
      return getSoftLineDeleteSpan(text, selection.start, direction);
  }
}

function getCharDeleteSpan(
  text: string,
  caret: number,
  direction: 1 | -1,
): SpliceRange | null {
  if (direction === -1) {
    return caret > 0 ? { offset: caret - 1, deleteCount: 1, insert: "" } : null;
  }

  return caret < text.length
    ? { offset: caret, deleteCount: 1, insert: "" }
    : null;
}

function getWordDeleteSpan(
  text: string,
  caret: number,
  direction: 1 | -1,
): SpliceRange | null {
  if (direction === -1) {
    return getWordDeleteSpanBackward(text, caret);
  }

  return getWordDeleteSpanForward(text, caret);
}

function getWordDeleteSpanBackward(
  text: string,
  caret: number,
): SpliceRange | null {
  if (caret <= 0) return null;

  const right = skipBackwardWhile(text, caret, isWhitespace);
  if (right <= 0) return { offset: 0, deleteCount: caret, insert: "" };

  const isWord = isWordChar(text[right - 1]);
  const left = skipBackwardWhile(
    text,
    right,
    (ch) => !isWhitespace(ch) && (isWord ? isWordChar(ch) : !isWordChar(ch)),
  );

  return { offset: left, deleteCount: caret - left, insert: "" };
}

function getWordDeleteSpanForward(
  text: string,
  caret: number,
): SpliceRange | null {
  if (caret >= text.length) return null;

  const left = skipForwardWhile(text, caret, isWhitespace);
  if (left >= text.length) {
    return { offset: caret, deleteCount: text.length - caret, insert: "" };
  }

  const isWord = isWordChar(text[left]);
  const right = skipForwardWhile(
    text,
    left,
    (ch) => !isWhitespace(ch) && (isWord ? isWordChar(ch) : !isWordChar(ch)),
  );

  return { offset: caret, deleteCount: right - caret, insert: "" };
}

function getSoftLineDeleteSpan(
  text: string,
  caret: number,
  direction: 1 | -1,
): SpliceRange | null {
  if (direction === -1) {
    return getSoftLineDeleteSpanBackward(text, caret);
  }

  return getSoftLineDeleteSpanForward(text, caret);
}

function getSoftLineDeleteSpanBackward(
  text: string,
  caret: number,
): SpliceRange | null {
  if (caret <= 0) return null;

  const prevBreak = text.lastIndexOf("\n", caret - 1);
  const lineStart = prevBreak + 1;

  return { offset: lineStart, deleteCount: caret - lineStart, insert: "" };
}

function getSoftLineDeleteSpanForward(
  text: string,
  caret: number,
): SpliceRange | null {
  if (caret >= text.length) return null;

  const nextBreak = text.indexOf("\n", caret);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;

  return { offset: caret, deleteCount: lineEnd - caret, insert: "" };
}

function skipBackwardWhile(
  text: string,
  from: number,
  test: (ch: string) => boolean,
): number {
  let i = from;
  while (i > 0 && test(text[i - 1])) i -= 1;
  return i;
}

function skipForwardWhile(
  text: string,
  from: number,
  test: (ch: string) => boolean,
): number {
  let i = from;
  while (i < text.length && test(text[i])) i += 1;
  return i;
}

function isWordChar(ch: string): boolean {
  return WORD_CHAR.test(ch);
}

function isWhitespace(ch: string): boolean {
  return WHITESPACE.test(ch);
}

/**
 * Applies a splice range to an element's DOM, preserving inline element structure.
 * At a text/element boundary, inserts inside the element.
 * At a boundary between two elements, `prefer` determines which element to insert into.
 */
export function applyToElement(
  element: HTMLElement,
  { offset, deleteCount, insert }: SpliceRange,
  prefer: "left" | "right" = "right",
) {
  const start = Element.findNodeAt(element, offset, prefer);
  const end =
    deleteCount > 0
      ? Element.findNodeAt(element, offset + deleteCount, prefer)
      : start;

  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  range.deleteContents();

  if (insert) {
    range.insertNode(document.createTextNode(insert));
  }

  element.normalize();
  for (const child of Array.from(element.querySelectorAll("*"))) {
    if (!child.textContent) child.remove();
  }
}

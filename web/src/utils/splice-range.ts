import { SelectionRange } from "./selection-range.js";

export type SpliceRange = {
  offset: number;
  deleteCount: number;
  insert: string;
};

type Direction = "backward" | "forward";
type Unit = "char" | "word" | "softLine";

const WORD_CHAR = /[\p{L}\p{N}_]/u;
const WHITESPACE = /\s/;

export const SpliceRange = {
  fromInputEvent,
  fromSelectionRange,
  apply(text: string, { offset, deleteCount, insert }: SpliceRange) {
    const chars = [...text];
    chars.splice(offset, deleteCount, insert);
    return chars.join("");
  },
};

/**
 * Get splice range that would result if you applied the InputEvent to the given string at selection.
 */
function fromInputEvent(
  event: InputEvent,
  text: string,
  selection: SelectionRange,
): SpliceRange | null {
  const selected = fromSelectionRange(selection);

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
      return deleteFromCaret(text, selection, "backward", "char");

    case "deleteContentForward":
      return deleteFromCaret(text, selection, "forward", "char");

    case "deleteWordBackward":
      return deleteFromCaret(text, selection, "backward", "word");

    case "deleteWordForward":
      return deleteFromCaret(text, selection, "forward", "word");

    case "deleteSoftLineBackward":
      return deleteFromCaret(text, selection, "backward", "softLine");

    case "deleteSoftLineForward":
      return deleteFromCaret(text, selection, "forward", "softLine");

    default:
      return null;
  }
}

/**
 * Get splice range that would result if you hit delete on a non-collapsed selection.
 */
function fromSelectionRange(selection: SelectionRange): SpliceRange | null {
  if (selection.end === null) return null;

  const deleteCount = Math.max(0, selection.end - selection.start);
  if (deleteCount === 0) return null;

  return { offset: selection.start, deleteCount, insert: "" };
}

function insertAtSelection(
  selection: SelectionRange,
  selected: SpliceRange | null,
  insert: string,
): SpliceRange {
  return {
    offset: selection.start,
    deleteCount: selected?.deleteCount ?? 0,
    insert,
  };
}

function deleteFromCaret(
  text: string,
  selection: SelectionRange,
  direction: Direction,
  unit: Unit,
): SpliceRange | null {
  const selected = fromSelectionRange(selection);
  if (selected) return selected;

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
  direction: Direction,
): SpliceRange | null {
  if (direction === "backward") {
    return caret > 0 ? { offset: caret - 1, deleteCount: 1, insert: "" } : null;
  }

  return caret < text.length
    ? { offset: caret, deleteCount: 1, insert: "" }
    : null;
}

function getWordDeleteSpan(
  text: string,
  caret: number,
  direction: Direction,
): SpliceRange | null {
  if (direction === "backward") {
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
  direction: Direction,
): SpliceRange | null {
  if (direction === "backward") {
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

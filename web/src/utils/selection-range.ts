import { CaretTarget } from "./caret-target.js";
import { isElementWithTag } from "./element.js";

/** Text offsets within an element; end equals start for a collapsed caret. */
export type SelectionRange = { start: number; end: number };

/**
 * Utilities for reading and applying text selections within DOM elements.
 * Works with both contenteditable elements and input/textarea elements.
 */
export const SelectionRange = {
  read,
  clear,
  apply,
  moveVertically,

  isCollapsed(selection: SelectionRange) {
    return selection.start === selection.end;
  },

  shift(range: SelectionRange, delta: number): SelectionRange {
    return {
      start: range.start + delta,
      end: range.end + delta,
    };
  },

  maxOffset(element: HTMLElement): number {
    return (element.textContent ?? "").length;
  },
};

/**
 * Get selection offsets within `element`, or null if selection is outside.
 */
function read(element: HTMLElement): SelectionRange | null {
  // Inputs are pretty straightforward
  if (
    isElementWithTag(element, "input") ||
    isElementWithTag(element, "textarea")
  ) {
    if (element.selectionStart === null) return null;
    const start = element.selectionStart;
    const end = element.selectionEnd ?? start;
    return { start, end };
  }

  const range = getRange();

  if (!range || !element.contains(range.startContainer)) return null;

  const start = getTextUpToNode(
    element,
    range.startContainer,
    range.startOffset,
  ).length;
  const end = range.collapsed
    ? start
    : getTextUpToNode(element, range.endContainer, range.endOffset).length;

  return { start, end };
}

/** @internal */
function getRange(): Range | null {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  return sel.getRangeAt(0);
}

/** Unselects all elements. */
function clear(element: HTMLElement) {
  window.getSelection()?.removeAllRanges();
  element.blur();
}

/** Set the selection within `element` by text offsets. */
function apply(element: HTMLElement, selection: SelectionRange) {
  if (
    isElementWithTag(element, "input") ||
    isElementWithTag(element, "textarea")
  ) {
    element.focus();
    element.setSelectionRange(selection.start, selection.end);
    return;
  }

  clear(element);

  if (!element.textContent && selection.start === 0 && selection.end === 0) {
    element.focus();
    return;
  }

  const start = CaretTarget.resolve(element, selection.start);
  const end = !SelectionRange.isCollapsed(selection)
    ? CaretTarget.resolve(element, selection.end)
    : start;

  if (
    !start ||
    !end ||
    !CaretTarget.isAnchored(start) ||
    !CaretTarget.isAnchored(end)
  ) {
    console.warn("Invalid selection range", {
      element,
      selection,
    });
    return;
  }

  const r = document.createRange();
  r.setStart(CaretTarget.getText(start), start.offset);
  r.setEnd(CaretTarget.getText(end), end.offset);

  window.getSelection()?.addRange(r);
}

/**
 * Compute the caret range when moving up/down between blocks.
 * @note noop for non-collapsed ranges.
 */
function moveVertically(
  currentElement: HTMLElement,
  targetElement: HTMLElement,
  direction: 1 | -1,
): SelectionRange | null {
  const range = window.getSelection()?.getRangeAt(0);
  if (!range || !range.collapsed) return null;
  if (!currentElement.contains(range.startContainer)) {
    console.warn("Caret startContainer is outside current element.", {
      currentElement,
      targetElement,
      direction,
      range,
    });
    return null;
  }

  const caretRect = getCaretRect(range);
  if (!caretRect)
    return moveVerticallyByOffset(
      currentElement,
      targetElement,
      direction,
      range,
    );
  else
    return moveVerticallyByGeometry(
      currentElement,
      targetElement,
      direction,
      caretRect,
    );
}

/** Small inset in px to probe inside element bounds and avoid boundary precision issues. */
const PROBE_INSET_PX = 10;

/**
 * Move vertically between blocks using layout geometry.
 * @internal
 */
function moveVerticallyByGeometry(
  currentElement: HTMLElement,
  targetElement: HTMLElement,
  direction: 1 | -1,
  caretRect: DOMRect,
): SelectionRange | null {
  const currentRect = currentElement.getBoundingClientRect();
  const pos = direction === 1 ? "top" : "bottom";
  const distance = Math.floor(Math.abs(caretRect[pos] - currentRect[pos]));

  // Ensure the caret is close enough to the boundary line.
  if (distance > PROBE_INSET_PX) return null;

  // Project the x-position into the target element and resolve a text offset.
  const targetRect = targetElement.getBoundingClientRect();
  const targetOffset = getOffsetFromPoint(
    targetElement,
    caretRect.x,
    direction === 1
      ? targetRect.bottom - caretRect.height / 2
      : targetRect.top + caretRect.height / 2,
  );

  return {
    start:
      targetOffset ??
      (direction === 1 ? SelectionRange.maxOffset(targetElement) : 0),
    end:
      targetOffset ??
      (direction === 1 ? SelectionRange.maxOffset(targetElement) : 0),
  };
}

/**
 * Move vertically when the current element is whitespace-only.
 * The caret rect can be zero for whitespace-only text, so geometry is unreliable.
 * @internal
 */
function moveVerticallyByOffset(
  currentElement: HTMLElement,
  targetElement: HTMLElement,
  direction: 1 | -1,
  range: Range,
): SelectionRange | null {
  // Derive the caret text offset from the selection range.
  const text = currentElement.textContent ?? "";
  const caretOffset = getTextUpToNode(
    currentElement,
    range.startContainer,
    range.startOffset,
  ).length;

  // Compute the caret line index by counting `\n` before that offset.
  const lines = text.replace(/\n$/, "").split("\n");
  const lineIndex = text.slice(0, caretOffset).split("\n").length - 1;
  const lastLineIndex = Math.max(0, lines.length - 1);
  const isBoundaryLine =
    direction === 1 ? lineIndex === 0 : lineIndex === lastLineIndex;

  // Allow movement only if the caret is on the boundary line; otherwise null.
  if (!isBoundaryLine) return null;

  // When navigating down from an empty block, selection always starts at 0, 0
  if (direction === -1) return { start: 0, end: 0 };

  // Moving up from an empty/whitespace-only block: start of target's last
  // visual line, or fallback to max offset.
  const targetRect = targetElement.getBoundingClientRect();
  const lineStartOffset = getOffsetFromPoint(
    targetElement,
    targetRect.left + PROBE_INSET_PX,
    targetRect.bottom - PROBE_INSET_PX,
  );

  const start = lineStartOffset ?? SelectionRange.maxOffset(targetElement);
  return { start, end: start };
}

/** @internal */
function getCaretRect(range: Range) {
  const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
  return isZeroRect(rect) ? null : rect;
}

/** @internal */
function isZeroRect(rect: DOMRect) {
  return (
    rect.top === 0 && rect.bottom === 0 && rect.left === 0 && rect.right === 0
  );
}

/**
 * Resolve a text offset from viewport coords inside `element`.
 * @internal
 */
function getOffsetFromPoint(
  element: HTMLElement,
  x: number,
  y: number,
): number | null {
  const range = document.caretRangeFromPoint?.(x, y);
  if (range && element.contains(range.startContainer)) {
    return getTextUpToNode(element, range.startContainer, range.startOffset)
      .length;
  }

  const pos = document.caretPositionFromPoint?.(x, y);
  if (pos && element.contains(pos.offsetNode)) {
    return getTextUpToNode(element, pos.offsetNode, pos.offset).length;
  }

  console.warn("Failed to resolve caret position from coordinates.", element, {
    point: { x, y },
    textContent: element.textContent,
    supports: {
      caretRangeFromPoint: typeof document.caretRangeFromPoint === "function",
      caretPositionFromPoint:
        typeof document.caretPositionFromPoint === "function",
    },
  });
  return null;
}

/**
 * Get the text content from the start of `element` up to a specific DOM node + offset.
 * Traverses the DOM and returns the plain text represented by that range.
 * @internal
 */
function getTextUpToNode(
  element: HTMLElement,
  node: Node,
  offset: number,
): string {
  const pre = document.createRange();
  pre.selectNodeContents(element);
  pre.setEnd(node, offset);
  return pre.toString();
}

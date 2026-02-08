/** Text offsets within an element; end equals start for a collapsed caret. */
export type SelectionRange = { start: number; end: number };

type Direction = "up" | "down";

export const SelectionRange = {
  isCollapsed(selection: SelectionRange) {
    return isCollapsed(selection);
  },

  shift(range: SelectionRange, delta: number): SelectionRange {
    return {
      start: range.start + delta,
      end: range.end + delta,
    };
  },

  // functions on HTMLElement
  read,
  clear,
  apply,
  applyMaybe,
  maxOffset,
  moveVertically,
};

/** Get selection offsets within `element`, or null if selection is outside. */
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

  const doc = element.ownerDocument;
  const win =
    doc.defaultView || (doc as { parentWindow?: Window }).parentWindow;

  const sel = win?.getSelection();

  if (!sel?.rangeCount) return null;

  const range = sel.getRangeAt(0);

  if (!element.contains(range.startContainer)) return null;

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

/** Unselects all elements. Handles the appropriate DOM instance for the given element. */
function clear(element: HTMLElement) {
  const doc = element.ownerDocument;
  const win =
    doc.defaultView || (doc as { parentWindow?: Window }).parentWindow;

  const sel = win?.getSelection();
  if (!sel) return;

  sel.removeAllRanges();
  element.blur();
}

/** Set the selection within `element` by text offsets. */
function apply(element: HTMLElement, selection: SelectionRange) {
  const doc = element.ownerDocument;
  const win =
    doc.defaultView || (doc as { parentWindow?: Window }).parentWindow;

  if (
    isElementWithTag(element, "input") ||
    isElementWithTag(element, "textarea")
  ) {
    element.setSelectionRange(selection.start, selection.end);
    return;
  }

  clear(element);

  const sel = win?.getSelection();
  if (!sel) return;

  sel.removeAllRanges();

  if (element.textContent === "" && selection.start === 0) {
    element.focus();
    return;
  }

  const start = resolveOffset(element, selection.start);
  const end = resolveOffset(element, selection.end);

  if (!start || !end) {
    console.warn("Failed to resolve selection target text node.", element, {
      resolved: { start, end },
      target: selection,
      textContent: element.textContent,
    });
    return;
  }

  const r = doc.createRange();
  r.setStart(start.node, start.offset);
  r.setEnd(end.node, end.offset);
  sel.addRange(r);
}

function applyMaybe(element: HTMLElement, selection: SelectionRange | null) {
  if (!selection) clear(element);
  else apply(element, selection);
}

/** Max selectable offset (text length) for `element`. */
function maxOffset(element: HTMLElement): number {
  return (element.textContent ?? "").length;
}

/** Compute the caret range when moving up/down between blocks. */
function moveVertically(
  currentElement: HTMLElement,
  targetElement: HTMLElement,
  direction: Direction,
): SelectionRange | null {
  const doc = currentElement.ownerDocument;
  const win =
    doc.defaultView || (doc as { parentWindow?: Window }).parentWindow;

  const sel = win?.getSelection();
  if (!sel?.rangeCount) return null;

  const range = sel.getRangeAt(0);
  if (!range.collapsed) {
    return null;
  }
  if (!currentElement.contains(range.startContainer)) {
    console.warn(
      "Caret startContainer is outside current element.",
      currentElement,
      "→",
      targetElement,
      {
        direction,
        startContainer: range.startContainer,
      },
    );
    return null;
  }

  const caretRect = range.getClientRects()[0] ?? range.getBoundingClientRect();
  const currentLines = getLineRects(currentElement);
  const boundaryLine =
    direction === "up"
      ? currentLines[0]
      : currentLines[currentLines.length - 1];

  // When the element is empty, caretRect will be all 0, even though the element
  // has a caret. We'll just assume that the move is valid and starts at the
  // beginning of the line (since this line is empty).
  if (caretRect.top === 0 && caretRect.height === 0)
    return { start: 0, end: 0 };
  if (Math.round(caretRect.top) !== Math.round(boundaryLine.top)) return null;
  if (!boundaryLine) {
    console.warn("Failed to resolve boundary line.", currentElement, {
      direction,
      lineCount: currentLines.length,
    });

    return null;
  }

  const targetLines = getLineRects(targetElement);
  const targetLine =
    direction === "up" ? targetLines[targetLines.length - 1] : targetLines[0];
  const targetOffset =
    targetLine &&
    getOffsetFromPoint(
      targetElement,
      caretRect.left,
      targetLine.top + targetLine.height / 2,
    );

  return {
    start: targetOffset ?? (direction === "up" ? maxOffset(targetElement) : 0),
    end: targetOffset ?? (direction === "up" ? maxOffset(targetElement) : 0),
  };
}

function isCollapsed(selection: SelectionRange) {
  return selection.start === selection.end;
}

/** Internals */

/** Line rectangles for the element's text layout. */
function getLineRects(element: HTMLElement): DOMRect[] {
  const doc = element.ownerDocument;

  const range = doc.createRange();
  range.selectNodeContents(element);

  const rects = Array.from(range.getClientRects());

  if (rects.length === 0) {
    return [element.getBoundingClientRect()];
  }

  const lines: DOMRect[] = [];
  let lastTop = Number.NaN;

  for (const rect of rects) {
    const top = Math.round(rect.top);
    if (top !== lastTop) {
      lines.push(rect);
      lastTop = top;
    }
  }

  return lines;
}

/** Resolve a text offset from viewport coords inside `element`. */
function getOffsetFromPoint(
  element: HTMLElement,
  x: number,
  y: number,
): number | null {
  const doc = element.ownerDocument;

  const range = doc.caretRangeFromPoint?.(x, y);
  if (range && element.contains(range.startContainer)) {
    return getTextUpToNode(element, range.startContainer, range.startOffset)
      .length;
  }

  const pos = doc.caretPositionFromPoint?.(x, y);
  if (pos && element.contains(pos.offsetNode)) {
    return getTextUpToNode(element, pos.offsetNode, pos.offset).length;
  }

  console.warn("Failed to resolve caret position from coordinates.", element, {
    point: { x, y },
    textContent: element.textContent,
    supports: {
      caretRangeFromPoint: typeof doc.caretRangeFromPoint === "function",
      caretPositionFromPoint: typeof doc.caretPositionFromPoint === "function",
    },
  });
  return null;
}

/**
 * Get the text content from the start of `element` up to a specific DOM node + offset.
 * Traverses the DOM and returns the plain text represented by that range.
 */
function getTextUpToNode(
  element: HTMLElement,
  node: Node,
  offset: number,
): string {
  const doc = element.ownerDocument;

  const pre = doc.createRange();
  pre.selectNodeContents(element);
  pre.setEnd(node, offset);
  return pre.toString();
}

/** Resolve a text offset to a concrete text node and node offset. */
function resolveOffset(
  element: HTMLElement,
  offset: number,
): { node: Text; offset: number } | null {
  const doc = element.ownerDocument;

  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let remaining = offset;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!(node instanceof Text)) continue;

    if (remaining <= node.data.length) {
      return { node, offset: remaining };
    }

    remaining -= node.data.length;
  }

  console.warn("Offset could not be mapped to any text node.", element, {
    offset,
    textContent: element.textContent,
    max: maxOffset(element),
  });
  return null;
}

/** Helper guard that works with non-global instances of dom (instanceof doesn't) */
function isElementWithTag<T extends keyof HTMLElementTagNameMap>(
  element: HTMLElement,
  tag: T,
): element is HTMLElementTagNameMap[T] {
  return element.tagName === tag.toUpperCase();
}

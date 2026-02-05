/** Text offsets within an element; end is null for a collapsed caret. */
export type Selection = { start: number; end: number | null };

/** Get selection offsets within `element`, or null if selection is outside. */
export function getSelectionRange(element: HTMLElement): Selection | null {
  // Inputs are pretty straightforward
  if (
    isElementWithTag(element, "input") ||
    isElementWithTag(element, "textarea")
  ) {
    if (element.selectionStart === null) return null;
    return {
      start: element.selectionStart,
      end:
        element.selectionEnd === element.selectionStart
          ? null
          : element.selectionEnd,
    };
  }

  const doc = element.ownerDocument;
  const win =
    doc.defaultView || (doc as { parentWindow?: Window }).parentWindow;

  const sel = win?.getSelection();

  if (!sel?.rangeCount) return null;

  const range = sel.getRangeAt(0);

  if (!element.contains(range.startContainer)) return null;

  const start = getOffsetFromNode(
    element,
    range.startContainer,
    range.startOffset,
  );
  const end = range.collapsed
    ? null
    : getOffsetFromNode(element, range.endContainer, range.endOffset);

  return { start, end };
}

/** Set the selection within `element` by text offsets. */
export function setSelectionRange(
  element: HTMLElement,
  range: Selection | null,
) {
  const doc = element.ownerDocument;
  const win =
    doc.defaultView || (doc as { parentWindow?: Window }).parentWindow;

  if (
    isElementWithTag(element, "input") ||
    isElementWithTag(element, "textarea")
  ) {
    if (!range) element.blur();
    else element.setSelectionRange(range.start, range.end ?? range.start);
    return;
  }

  const sel = win?.getSelection();

  if (!sel) return;

  sel.removeAllRanges();

  if (range === null) return;

  const start = resolveOffset(element, range.start);
  const end = resolveOffset(element, range.end ?? range.start);

  if (!start || !end) return;

  const r = doc.createRange();
  r.setStart(start.node, start.offset);
  r.setEnd(end.node, end.offset);
  sel.addRange(r);
}

/** Max selectable offset (text length) for `element`. */
export function getMaxSelectionOffset(element: HTMLElement): number {
  const text = element.textContent ?? "";
  // Empty rich text renders as &nbsp; (char 160)
  return text === String.fromCharCode(160) ? 0 : text.length;
}

/** Compute the caret range when moving up/down between blocks. */
export function getVerticalNavigationRange(
  currentElement: HTMLElement,
  targetElement: HTMLElement,
  direction: "up" | "down",
): Selection | null {
  const doc = currentElement.ownerDocument;
  const win =
    doc.defaultView || (doc as { parentWindow?: Window }).parentWindow;

  const sel = win?.getSelection();
  if (!sel?.rangeCount) return null;

  const range = sel.getRangeAt(0);
  if (!range.collapsed || !currentElement.contains(range.startContainer)) {
    return null;
  }

  const caretRect = range.getClientRects()[0] ?? range.getBoundingClientRect();
  const currentLines = getLineRects(currentElement);
  const boundaryLine =
    direction === "up"
      ? currentLines[0]
      : currentLines[currentLines.length - 1];

  if (
    !boundaryLine ||
    Math.round(caretRect.top) !== Math.round(boundaryLine.top)
  ) {
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
    start:
      targetOffset ??
      (direction === "up" ? getMaxSelectionOffset(targetElement) : 0),
    end: null,
  };
}

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
    return getOffsetFromNode(element, range.startContainer, range.startOffset);
  }

  const pos = doc.caretPositionFromPoint?.(x, y);
  if (pos && element.contains(pos.offsetNode)) {
    return getOffsetFromNode(element, pos.offsetNode, pos.offset);
  }

  return null;
}

/** Convert a DOM node/offset to a text offset within `element`. */
function getOffsetFromNode(
  element: HTMLElement,
  node: Node,
  offset: number,
): number {
  const doc = element.ownerDocument;

  const pre = doc.createRange();
  pre.selectNodeContents(element);
  pre.setEnd(node, offset);
  return pre.toString().length;
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

  return null;
}

export function mergeSelections(
  selection: Selection,
  ...selections: Selection[]
): Selection {
  return selections.reduce(
    (acc, sel) => ({
      start: Math.min(acc.start, sel.start),
      end:
        acc.end === null && sel.end === null
          ? null
          : Math.max(acc.end ?? acc.start, sel.end ?? sel.start),
    }),
    selection,
  );
}

/** Helper guard that works with non-global instances of dom (instanceof doesn't) */
function isElementWithTag<T extends keyof HTMLElementTagNameMap>(
  element: HTMLElement,
  tag: T,
): element is HTMLElementTagNameMap[T] {
  return element.tagName === tag.toUpperCase();
}

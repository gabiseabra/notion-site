import { Element } from "./element.js";

/**
 * Boundary between inline elements/text at a specific text offset.
 *
 * - `start`: right before an inline element.
 * - `end`: right after an inline element.
 * - `between`: between two adjacent inline elements.
 */
export type ElementBoundary =
  | { type: "start"; left: Text; right: Element }
  | { type: "end"; left: Element; right: Text }
  | { type: "between"; left: Element; right: Element };

/**
 * Position kind at a given offset.
 *
 * - `inside`: offset is inside text owned by an inline element.
 * - `outside`: offset is inside a root-level text node.
 * - `boundary`: offset is exactly on an inline boundary.
 */
export type ElementOffset =
  | { type: "inside"; node: Element; offset: number }
  | { type: "outside"; node: Text; offset: number }
  | { type: "boundary"; boundary: ElementBoundary };

export const ElementOffset = {
  read,

  /**
   * Resolves an `ElementOffset` into a concrete DOM position (`node` + `offset`).
   * @note for element nodes, offsets are interpreted as text offsets within
   *       that element's text content.
   * @returns a DOM Node and relative offset within that node.
   * - `inside`: returns the inline element and its relative offset.
   * - `outside`: returns the text node and its relative offset.
   * - `boundary`:
   *   - `start`: resolves to the right inline element at offset `0`.
   *   - `end`: resolves to the left inline element at its text end.
   *   - `between`: uses `prefer` to pick a side:
   *     - `-1` => left element at its text end
   *     - `1`  => right element at offset `0`
   */
  extract(
    elementOffset: ElementOffset,
    prefer: -1 | 1 = -1,
  ): { node: Node; offset: number } {
    if (elementOffset.type === "inside")
      return { node: elementOffset.node, offset: elementOffset.offset };
    if (elementOffset.type === "outside")
      return { node: elementOffset.node, offset: elementOffset.offset };

    const { boundary } = elementOffset;

    if (
      boundary.type === "end" ||
      (boundary.type == "between" && prefer === -1)
    )
      return {
        node: boundary.left,
        offset: boundary.left.textContent?.length ?? 0,
      };

    return { node: boundary.right, offset: 0 };
  },
};

function read(element: HTMLElement, offset: number): ElementOffset | null {
  const texts = Element.getTextNodes(element);

  for (let i = 0, pos = 0; i < texts.length; i++) {
    const text = texts[i];
    const len = text.textContent?.length ?? 0;
    const next = pos + len;

    const left =
      text.parentElement && text.parentElement !== element
        ? text.parentElement
        : null;

    const nextText = texts[i + 1];
    const right =
      nextText?.parentElement && nextText.parentElement !== element
        ? nextText.parentElement
        : null;

    if (offset > pos && offset < next) {
      return left
        ? { type: "inside", node: left, offset: offset - pos }
        : { type: "outside", node: text, offset: offset - pos };
    }

    if (offset === pos) {
      if (!left) return { type: "outside", node: text, offset: 0 };
      return { type: "boundary", boundary: { type: "end", left, right: text } };
    }

    if (offset === next) {
      const boundary = ((): ElementBoundary | undefined => {
        if (left && right) return { type: "between", left, right };
        if (left && nextText) return { type: "end", left, right: nextText };
        if (right) return { type: "start", left: text, right };
      })();

      if (boundary) return { type: "boundary", boundary };
      return { type: "outside", node: text, offset: len };
    }

    pos = next;
  }

  const first = element.firstElementChild;
  const last = element.lastElementChild;

  if (!first || !last) return null;
  if (first === last) return { type: "inside", node: first, offset: 0 };
  return {
    type: "boundary",
    boundary: { type: "between", left: first, right: last },
  };
}

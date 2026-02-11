import { liftMaybe } from "@notion-site/common/utils/fp.js";
import { Element } from "./element.js";

/**
 * Boundary between an inline element and text node or two elements.
 *
 * - `start`: right before an inline element.
 * - `end`: right after an inline element.
 * - `between`: between two adjacent inline elements.
 */
export type InlineBoundary =
  | { type: "start"; left: Text; right: Element }
  | { type: "end"; left: Element; right: Text }
  | { type: "between"; left: Element; right: Element };

/**
 * Position of the caret with extra information about surrounding nodes.
 *
 * - `inside`: offset is inside text owned by an inline element.
 * - `outside`: offset is inside a root-level text node.
 * - `boundary`: offset is exactly on an inline boundary.
 */
export type CaretOffset =
  | { type: "inside"; node: Element; offset: number }
  | { type: "outside"; node: Text; offset: number }
  | { type: "boundary"; boundary: InlineBoundary };

export type DOMPosition = {
  node: Node;
  offset: number;
};

export const CaretOffset = {
  read,
  toDOMPosition,
  resolve: (element: HTMLElement, offset: number, prefer?: -1 | 1) =>
    liftMaybe(toDOMPosition)(read(element, offset), prefer),
};

function read(element: HTMLElement, offset: number): CaretOffset | null {
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
      const boundary = ((): InlineBoundary | undefined => {
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

/**
 * Resolves a `CaretOffset` into a concrete DOM position (`node` + `offset`).
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
function toDOMPosition(
  caret: CaretOffset,
  prefer: -1 | 1 = -1,
): { node: Node; offset: number } {
  if (caret.type === "inside")
    return { node: caret.node, offset: caret.offset };
  if (caret.type === "outside")
    return { node: caret.node, offset: caret.offset };

  const { boundary } = caret;

  if (boundary.type === "end" || (boundary.type == "between" && prefer === -1))
    return {
      node: boundary.left,
      offset: boundary.left.textContent?.length ?? 0,
    };

  return { node: boundary.right, offset: 0 };
}

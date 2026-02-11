import { WithRequired } from "@notion-site/common/types/object.js";
import { liftMaybe } from "@notion-site/common/utils/fp.js";
import { Element } from "./element.js";

/**
 * Inline anchor candidate.
 * - `text`: text node inside an inline child element.
 * - `element`: empty inline child element (no text content yet).
 */
export type Anchor =
  | { type: "text"; node: WithRequired<Text, "parentElement"> }
  | { type: "element"; element: HTMLElement };

/**
 * Caret exactly on a boundary around inline content.
 * - `start`: before an inline anchor next to root text.
 * - `end`: after an inline anchor next to root text.
 * - `between`: between two adjacent inline anchors.
 */
export type BoundaryAnchor =
  | { type: "start"; left: Text; right: Anchor }
  | { type: "end"; left: Anchor; right: Text }
  | { type: "between"; left: Anchor; right: Anchor };

/**
 * Caret position of an element or text node at a relative offset.
 * - `inside`: inside inline content.
 * - `boundary`: exactly on an inline boundary.
 */
export type CaretAnchor =
  | { type: "inside"; node: Anchor; offset: number }
  | { type: "boundary"; boundary: BoundaryAnchor };

/**
 * Concrete caret placement target.
 * Represents where the caret should be placed after resolving an anchor.
 */
export type CaretTarget = Anchor & {
  offset: number;
};

/**
 * CaretTarget that already has a text node that can be extracted and selected.
 * Otherwise, you need to create the node inside of the target element before
 * being able to select it.
 */
export type AnchoredCaretTarget = Exclude<CaretTarget, { type: "element" }>;

/**
 * Utilities to map between a plain text offset in a root editable element and a
 * concrete DOM caret target.
 *
 * This module bridges offset-based editor logic and DOM node/offset placement,
 * while preferring inline anchors when available so typing lands in the expected
 * element.
 */
export const CaretTarget = {
  getAnchor,
  fromAnchor,
  resolve: (element: HTMLElement, offset: number, prefer?: -1 | 1) =>
    liftMaybe(fromAnchor)(getAnchor(element, offset), prefer),

  isAnchored(target: CaretTarget): target is AnchoredCaretTarget {
    return target.type !== "element";
  },

  getText(target: AnchoredCaretTarget): Text {
    return target.node;
  },

  allocateText(target: CaretTarget): Text {
    if (target.type === "text") return target.node;
    if (target.element.firstChild instanceof Text)
      return target.element.firstChild;
    const node = document.createTextNode("");
    target.element.appendChild(node);
    return node;
  },
};

/**
 * Try to find where the caret could land inside of the element at the given offset.
 * @returns `null` when the offset is out of bounds.
 */
function getAnchor(element: HTMLElement, offset: number): CaretAnchor | null {
  const texts = Element.getTextNodes(element);

  // Walk text nodes in order, tracking the running text offset.
  for (let i = 0, pos = 0; i < texts.length; i++) {
    const text = texts[i];
    const nextText = texts[i + 1];

    const len = text.textContent?.length ?? 0;
    const next = pos + len;

    // Resolve inline anchors adjacent to this text node (if any).
    const left =
      textAnchor(text, element) ??
      elementAnchor(text.previousElementSibling, element);
    const right =
      elementAnchor(text.nextElementSibling, element) ??
      textAnchor(nextText, element);

    // Offset inside this text range: prefer inline anchor if present.
    if (offset > pos && offset < next) {
      return {
        type: "inside",
        node: left ?? anchor(text, element, document.body),
        offset: offset - pos,
      };
    }

    // Offset exactly at the start of this text node.
    if (offset === pos) {
      if (!left)
        return {
          type: "inside",
          node: anchor(text, element, document.body),
          offset: 0,
        };
      if (pos === 0 && left.type === "text")
        return {
          type: "boundary",
          boundary: { type: "start", left: text, right: left },
        };
      return { type: "boundary", boundary: { type: "end", left, right: text } };
    }

    // Offset exactly at the end of this text node.
    if (offset === next) {
      const boundary = ((): BoundaryAnchor | undefined => {
        if (left && right) return { type: "between", left, right };
        if (left && nextText) return { type: "end", left, right: nextText };
        if (right) return { type: "start", left: text, right };
      })();

      if (boundary) return { type: "boundary", boundary };
      return {
        type: "inside",
        node: anchor(text, element, document.body),
        offset: len,
      };
    }

    // Advance to the next text node, accounting for empty inline elements.
    pos = next + (elementAnchor(text.nextElementSibling, element) ? 1 : 0);
  }

  // No text nodes matched; resolve based on inline children or empty element.
  if (offset > 0) return null;

  const first = element.firstElementChild;
  const last = element.lastElementChild;

  const left = elementAnchor(first, element);
  const right = elementAnchor(last, element);

  if (left && right) {
    if (first === last) return { type: "inside", node: left, offset: 0 };
    return { type: "boundary", boundary: { type: "between", left, right } };
  }

  return { type: "inside", node: { type: "element", element }, offset: 0 };
}

/** @internal */
function textAnchor(
  node: Text | undefined | null,
  root: HTMLElement,
): Anchor | null {
  if (node && !!node.parentElement && node.parentElement !== root) {
    return { type: "text", node };
  }
  return null;
}

/** @internal */
function elementAnchor(
  element: Element | undefined | null,
  root: HTMLElement,
): Anchor | null {
  if (
    element instanceof HTMLElement &&
    !element.textContent &&
    element.parentElement === root
  ) {
    return { type: "element", element };
  }
  return null;
}

/** @internal */
function anchor(
  node: Text | undefined | null,
  element: HTMLElement,
  root: HTMLElement = element,
): Anchor {
  return textAnchor(node, root) ?? { type: "element", element };
}

/**
 * Resolves a `CaretOffset` into a concrete DOM position (`node` + `offset`).
 * @note for element nodes, offsets are interpreted as text offsets within
 *       that element's text content.
 * @returns a DOM Node and relative offset within that node.
 */
function fromAnchor(anchor: CaretAnchor, prefer: -1 | 1 = -1): CaretTarget {
  if (anchor.type === "inside")
    return { ...anchor.node, offset: anchor.offset };

  const { boundary } = anchor;

  if (boundary.type === "end" || (boundary.type == "between" && prefer === -1))
    return { ...boundary.left, offset: maxOffset(boundary.left) };

  return { ...boundary.right, offset: 0 };
}

/** @internal */
function maxOffset(anchor: Anchor) {
  return (
    (anchor.type === "text" ? anchor.node : anchor.element).textContent
      ?.length ?? 0
  );
}

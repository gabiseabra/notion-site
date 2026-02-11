import { WithRequired } from "@notion-site/common/types/object.js";
import { liftMaybe } from "@notion-site/common/utils/fp.js";
import { Element } from "./element.js";

export type Anchor =
  // Text node inside of element
  | { type: "text"; node: WithRequired<Text, "parentElement"> }
  // Empty inline element
  | { type: "element"; element: HTMLElement };

export type BoundaryAnchor =
  | { type: "start"; left: Text; right: Anchor }
  | { type: "end"; left: Anchor; right: Text }
  | { type: "between"; left: Anchor; right: Anchor };

export type CaretAnchor =
  | { type: "inside"; node: Anchor; offset: number }
  | { type: "outside"; node: Text; offset: number }
  | { type: "boundary"; boundary: BoundaryAnchor };

export type CaretTarget = (Anchor | { type: "root"; node: Text }) & {
  offset: number;
};

type AnchoredCaretTarget = Exclude<CaretTarget, { type: "element" }>;

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
    if (CaretTarget.isAnchored(target)) return CaretTarget.getText(target);
    if (target.element.firstChild instanceof Text)
      return target.element.firstChild;
    const node = document.createTextNode("");
    target.element.appendChild(node);
    return node;
  },
};

function getAnchor(element: HTMLElement, offset: number): CaretAnchor | null {
  const texts = Element.getTextNodes(element);

  for (let i = 0, pos = 0; i < texts.length; i++) {
    const text = texts[i];
    const nextText = texts[i + 1];

    const len = text.textContent?.length ?? 0;
    const next = pos + len;

    const left =
      textAnchor(text, element) ??
      elementAnchor(text.previousElementSibling, element);
    const right =
      elementAnchor(text.nextElementSibling, element) ??
      textAnchor(nextText, element);

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
      const boundary = ((): BoundaryAnchor | undefined => {
        if (left && right) return { type: "between", left, right };
        if (left && nextText) return { type: "end", left, right: nextText };
        if (right) return { type: "start", left: text, right };
      })();

      if (boundary) return { type: "boundary", boundary };
      return { type: "outside", node: text, offset: len };
    }

    pos = next;
  }

  if (offset > 0) return null;

  const first = element.firstElementChild;
  const last = element.lastElementChild;

  const left = elementAnchor(first, element);
  const right = elementAnchor(last, element);

  if (left && right) {
    if (first === last) return { type: "inside", node: left, offset: 0 };
    return { type: "boundary", boundary: { type: "between", left, right } };
  }

  return null;
}

export type WithNonNullable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

function textAnchor(node: Text | undefined, root: HTMLElement): Anchor | null {
  if (node && !!node.parentElement && node.parentElement !== root) {
    return { type: "text", node };
  }
  return null;
}

function elementAnchor(
  element: Element | null,
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
function fromAnchor(anchor: CaretAnchor, prefer: -1 | 1 = -1): CaretTarget {
  if (anchor.type === "inside")
    return { ...anchor.node, offset: anchor.offset };
  if (anchor.type === "outside")
    return { type: "root", node: anchor.node, offset: anchor.offset };

  const { boundary } = anchor;

  if (boundary.type === "end" || (boundary.type == "between" && prefer === -1))
    return { ...boundary.left, offset: maxOffset(boundary.left) };

  return { ...boundary.right, offset: 0 };
}

function maxOffset(anchor: Anchor) {
  return (
    (anchor.type === "text" ? anchor.node : anchor.element).textContent
      ?.length ?? 0
  );
}

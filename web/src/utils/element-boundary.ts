import { Element } from "./element.js";

/**
 * Describes a text offset position at the edge of an inline element.
 * - `start`: entering an element (element is on the right)
 * - `end`: leaving an element (element is on the left)
 * - `between`: between two adjacent elements
 */
export type ElementBoundary =
  | { type: "start"; left: null; right: Element }
  | { type: "end"; left: Element; right: null }
  | { type: "between"; left: Element; right: Element };

export const ElementBoundary = {
  read,
};

/**
 * Finds the element boundary at a text offset within an element.
 * @returns `null` if the offset is inside text (not at an element edge)
 */
function read(element: HTMLElement, offset: number): ElementBoundary | null {
  const texts = Element.getTextNodes(element);
  if (texts.length === 0) {
    const right = element.firstElementChild;
    if (!right) return null;
    if (offset <= 0) return { type: "start", left: null, right };

    const left = element.lastElementChild;
    return left ? { type: "end", left, right: null } : null;
  }
  let pos = 0;

  for (let i = 0; i < texts.length; i++) {
    const len = texts[i].textContent?.length ?? 0;
    if (pos + len > offset) return null;
    if (pos + len < offset) {
      pos += len;
      continue;
    }

    const left =
      texts[i]?.parentElement !== element
        ? (texts[i]?.parentElement ?? null)
        : null;
    const right =
      texts[i + 1]?.parentElement !== element
        ? (texts[i + 1]?.parentElement ?? null)
        : null;

    if (left && right) return { type: "between", left, right };
    if (left) return { type: "end", left, right: null };
    if (right) return { type: "start", left: null, right };
    return null;
  }

  return null;
}

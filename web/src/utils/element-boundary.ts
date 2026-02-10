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
  const texts = collectTextNodes(element);
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

function collectTextNodes(element: HTMLElement): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

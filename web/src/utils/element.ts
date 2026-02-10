/**
 * Element manipulation utilities
 */
export const Element = {
  findNodeAt,
  getTextNodes,

  /** Guard that works with non-global instances of dom (instanceof doesn't) */
  isElementWithTag<T extends keyof HTMLElementTagNameMap>(
    element: HTMLElement,
    tag: T,
  ): element is HTMLElementTagNameMap[T] {
    return element.tagName === tag.toUpperCase();
  },
};

type DOMPosition = {
  /** Node containing the target offset. */
  node: Node;
  /** Offset within the node to the target. */
  offset: number;
};

function findNodeAt(
  element: HTMLElement,
  offset: number,
  prefer: "left" | "right" = "right",
): DOMPosition {
  const texts = getTextNodes(element);
  let pos = 0;

  for (let i = 0; i < texts.length; i++) {
    const node = texts[i];
    const len = node.textContent?.length ?? 0;
    const next = texts[i + 1];

    if (pos + len > offset) {
      return { node, offset: offset - pos };
    }

    if (pos + len === offset && next) {
      const useNext =
        prefer === "right"
          ? next.parentNode !== element || node.parentNode === element
          : next.parentNode !== element && node.parentNode === element;

      return useNext ? { node: next, offset: 0 } : { node, offset: len };
    }

    pos += len;
  }

  const last = texts[texts.length - 1];
  return last
    ? { node: last, offset: last.textContent?.length ?? 0 }
    : { node: element, offset: 0 };
}

function getTextNodes(element: HTMLElement): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

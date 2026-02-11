export const Element = {
  getTextNodes(element: Element): Text[] {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    return nodes;
  },

  /** Guard that works with non-global instances of dom (instanceof doesn't) */
  isElementWithTag<T extends keyof HTMLElementTagNameMap>(
    element: HTMLElement,
    tag: T,
  ): element is HTMLElementTagNameMap[T] {
    return element.tagName === tag.toUpperCase();
  },
};

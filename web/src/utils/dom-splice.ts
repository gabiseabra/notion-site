/**
 * Splice text content in an HTMLElement, preserving inner tag structure.
 * Returns a cloned element with the modifications applied.
 *
 * Works like String.prototype.splice - delete `deleteCount` characters
 * starting at `offset`, then insert `text` at that position.
 */
export function spliceElementText<T extends HTMLElement>(
  element: T,
  offset: number,
  deleteCount: number,
  text: string,
): T {
  const clone = element.cloneNode(true) as T;
  const nodes = collectTextNodes(clone);

  if (nodes.length === 0) {
    clone.textContent = text;
    return clone;
  }

  const start = findPosition(nodes, offset);
  const end = findPosition(nodes, offset + deleteCount);

  if (start.node === end.node) {
    start.node.data =
      start.node.data.slice(0, start.offset) +
      text +
      start.node.data.slice(end.offset);
  } else {
    start.node.data = start.node.data.slice(0, start.offset) + text;
    end.node.data = end.node.data.slice(end.offset);

    let between = false;
    for (const n of nodes) {
      if (n === start.node) {
        between = true;
        continue;
      }
      if (n === end.node) break;
      if (between) n.remove();
    }
    if (!end.node.data) end.node.remove();
  }

  return clone;
}

function collectTextNodes(el: HTMLElement): Text[] {
  const result: Text[] = [];
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode instanceof Text) result.push(walker.currentNode);
  }
  return result;
}

function findPosition(
  nodes: Text[],
  offset: number,
): { node: Text; offset: number } {
  let remaining = offset;
  for (const node of nodes) {
    if (remaining <= node.data.length) return { node, offset: remaining };
    remaining -= node.data.length;
  }
  const last = nodes[nodes.length - 1];
  return { node: last, offset: last.data.length };
}

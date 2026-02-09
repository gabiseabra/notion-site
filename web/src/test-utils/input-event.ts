import { fireEvent } from "@testing-library/react";
import { SelectionRange } from "../utils/selection-range.js";
import { SpliceRange } from "../utils/splice-range.js";

export const inputEvent = {
  delete: (el: HTMLElement, count = 1, dir: Direction = -1) =>
    deleteN(el, "char", count, dir),
  deleteWord: (el: HTMLElement, count = 1, dir: Direction = -1) =>
    deleteN(el, "word", count, dir),
  deleteLine: (el: HTMLElement, count = 1, dir: Direction = -1) =>
    deleteN(el, "line", count, dir),
  insert: (el: HTMLElement, text: string, mods: Modifiers = {}) =>
    [...text].forEach((ch) => simulate(el, "insertText", ch, ch, mods)),
  insertLine: (el: HTMLElement, count = 1, mods: Modifiers = {}) => {
    for (let i = 0; i < count; i++)
      simulate(el, "insertLineBreak", "Enter", null, {
        shiftKey: true,
        ...mods,
      });
  },
};

/** Internals */

type Modifiers = {
  altKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
};
type Direction = 1 | -1;
type DeleteUnit = keyof typeof DELETE_OPS;
// Registry: [operation][direction] → { inputType, key, modifiers }
const DELETE_OPS = {
  char: {
    [-1]: {
      inputType: "deleteContentBackward",
      key: "Backspace",
      modifiers: {},
    },
    [1]: {
      inputType: "deleteContentForward",
      key: "Delete",
      modifiers: {},
    },
  },
  word: {
    [-1]: {
      inputType: "deleteWordBackward",
      key: "Backspace",
      modifiers: { altKey: true },
    },
    [1]: {
      inputType: "deleteWordForward",
      key: "Delete",
      modifiers: { altKey: true },
    },
  },
  line: {
    [-1]: {
      inputType: "deleteSoftLineBackward",
      key: "Backspace",
      modifiers: { metaKey: true },
    },
    [1]: {
      inputType: "deleteSoftLineForward",
      key: "Delete",
      modifiers: { ctrlKey: true },
    },
  },
} as const;

/** Fire keydown → beforeinput → apply → input */
function simulate(
  element: HTMLElement,
  inputType: string,
  key: string,
  data: string | null,
  modifiers: Modifiers = {},
): void {
  const selection = SelectionRange.read(element);
  if (!selection) return;

  const text = element.textContent ?? "";

  // keydown
  fireEvent.keyDown(element, {
    key,
    ...modifiers,
  });

  // Command shortcuts (meta/ctrl + key) don't fire beforeinput for text insertion
  if (inputType === "insertText" && (modifiers.metaKey || modifiers.ctrlKey)) {
    return;
  }

  // beforeinput
  const beforeInput = new InputEvent("beforeinput", {
    inputType,
    data,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(beforeInput);
  if (beforeInput.defaultPrevented) return;

  // apply change
  const splice = SpliceRange.fromInputEvent(beforeInput, text, selection);
  if (splice) {
    element.innerHTML = spliceElementText(
      element,
      splice.offset,
      splice.deleteCount,
      splice.insert,
    ).innerHTML;
    SelectionRange.apply(element, SpliceRange.toSelectionRange(splice, 1));
  }

  // input
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function deleteN(
  element: HTMLElement,
  unit: DeleteUnit,
  count: number,
  direction: Direction,
): void {
  const config = DELETE_OPS[unit][direction];
  for (let i = 0; i < count; i++)
    simulate(element, config.inputType, config.key, null, config.modifiers);
}

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

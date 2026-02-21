import { fireEvent } from "@testing-library/react";
import { act } from "react";
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
  insertLine: (
    el: HTMLElement,
    count = 1,
    mods: Omit<Modifiers, "shiftKey"> = {},
  ) => {
    for (let i = 0; i < count; i++)
      simulate(el, "insertLineBreak", "Enter", null, {
        shiftKey: true,
        ...mods,
      });
  },
  insertParagraph: (
    el: HTMLElement,
    count = 1,
    mods: Omit<Modifiers, "shiftKey"> = {},
  ) => {
    for (let i = 0; i < count; i++)
      simulate(el, "insertParagraph", "Enter", null, {
        shiftKey: false,
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
  act(() => element.dispatchEvent(beforeInput));
  if (beforeInput.defaultPrevented) return;

  // apply change
  const splice = SpliceRange.fromInputEvent(beforeInput, text, selection);
  if (splice) {
    SpliceRange.applyToElement(element, splice);
    SelectionRange.apply(element, SpliceRange.toSelectionRange(splice, 1));
  }

  // input
  fireEvent.input(element);
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

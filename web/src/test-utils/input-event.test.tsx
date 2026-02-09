/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { SelectionRange } from "../utils/selection-range.js";
import { inputEvent } from "./input-event.js";

describe("inputEvent", () => {
  describe("applies content changes", () => {
    it("insertText: inserts text at end", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 5, end: 5 });
      inputEvent.insert(el, " World");

      expect(el).toMatchVisualSelection("Hello World|");
    });

    it("insertText: inserts text in middle", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Helo
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 2, end: 2 });
      inputEvent.insert(el, "l");

      expect(el).toMatchVisualSelection("Hel|lo");
    });

    it("insertText: replaces selection when typing over selected text", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 6, end: 11 });
      inputEvent.insert(el, "Universe");

      expect(el).toMatchVisualSelection("Hello Universe|");
    });

    it("insertLineBreak: inserts newline with Shift+Enter", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          HelloWorld
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 5, end: 5 });
      inputEvent.insertLine(el);

      expect(el).toMatchVisualSelection("Hello\n|World");
    });

    it("deleteContentBackward: deletes char with Backspace", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 5, end: 5 });
      inputEvent.delete(el);

      expect(el).toMatchVisualSelection("Hell|");
    });

    it("deleteContentForward: deletes char with Delete", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.delete(el, 1, 1);

      expect(el).toMatchVisualSelection("|ello");
    });

    it("deleteWordBackward: deletes word with Option+Backspace", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 11, end: 11 });
      inputEvent.deleteWord(el);

      expect(el).toMatchVisualSelection("Hello |");
    });

    it("deleteWordForward: deletes word with Option+Delete", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.deleteWord(el, 1, 1);

      expect(el).toMatchVisualSelection("| World");
    });

    it("deleteSoftLineBackward: deletes to line start with Cmd+Backspace", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 11, end: 11 });
      inputEvent.deleteLine(el);

      expect(el).toMatchVisualSelection("|");
    });

    it("deleteSoftLineForward: deletes to line end with Ctrl+Delete", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.deleteLine(el, 1, 1);

      expect(el).toMatchVisualSelection("|");
    });

    it("respects defaultPrevented on beforeinput", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      el.addEventListener("beforeinput", (e) => e.preventDefault());

      SelectionRange.apply(el, { start: 5, end: 5 });
      inputEvent.insert(el, " World");

      expect(el).toMatchVisualSelection("Hello|");
    });
  });

  describe("forwards events", () => {
    it("insertText: forwards all events on typing", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 5, end: 5 });
      inputEvent.insert(el, "X");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "X" }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "insertText", data: "X" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("insertLineBreak: forwards all events on Shift+Enter", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 5, end: 5 });
      inputEvent.insertLine(el);

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Enter", shiftKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "insertLineBreak" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteContentBackward: forwards all events on Backspace", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 5, end: 5 });
      inputEvent.delete(el);

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Backspace" }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteContentBackward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteContentForward: forwards all events on Delete", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.delete(el, 1, 1);

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Delete" }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteContentForward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteWordBackward: forwards all events on Option+Backspace", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 11, end: 11 });
      inputEvent.deleteWord(el);

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Backspace", altKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteWordBackward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteWordForward: forwards all events on Option+Delete", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.deleteWord(el, 1, 1);

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Delete", altKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteWordForward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteSoftLineBackward: forwards all events on Cmd+Backspace", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 11, end: 11 });
      inputEvent.deleteLine(el);

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Backspace", metaKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteSoftLineBackward" }),
      );
      expect(input).toHaveBeenCalledTimes(1);
    });

    it("deleteSoftLineForward: forwards all events on Ctrl+Delete", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      const beforeinput = jest.fn();
      const input = jest.fn();
      const keydown = jest.fn();
      el.addEventListener("beforeinput", beforeinput);
      el.addEventListener("input", input);
      el.addEventListener("keydown", keydown);

      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.deleteLine(el, 1, 1);

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Delete", ctrlKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteSoftLineForward" }),
      );
      expect(input).toHaveBeenCalled();
    });
  });
});

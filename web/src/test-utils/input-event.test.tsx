/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { SelectionRange } from "../utils/selection-range.js";
import { inputEvent } from "./input-event.js";

describe("inputEvent", () => {
  describe("insert", () => {
    it("inserts text in empty element", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning />,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.insert(el, "Hello");

      expect(el).toMatchVisualSelection("Hello|");
    });

    it("inserts text at end", () => {
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

    it("inserts text in middle", () => {
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

    it("replaces selection when typing over selected text", () => {
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

    it("fires keydown, beforeinput, and input events", () => {
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
  });

  describe("insertLine", () => {
    it("inserts newline", () => {
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

    it("fires keydown, beforeinput, and input events", () => {
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
  });

  describe("delete", () => {
    it("deletes char backward", () => {
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

    it("deletes char forward", () => {
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

    it("fires keydown, beforeinput, and input events", () => {
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
  });

  describe("deleteWord", () => {
    it("deletes word backward", () => {
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

    it("deletes word forward", () => {
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

    it("fires keydown, beforeinput, and input events", () => {
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
  });

  describe("deleteLine", () => {
    it("deletes line backward", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          {"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit"}
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 55, end: 55 });
      inputEvent.deleteLine(el);

      expect(el).toMatchVisualSelection("Lorem ipsum dolor sit amet,\n|");
    });

    it("deletes line forward", () => {
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          {"Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit"}
        </div>,
      );

      const el = container.querySelector("div")!;
      SelectionRange.apply(el, { start: 0, end: 0 });
      inputEvent.deleteLine(el, 1, 1);

      expect(el).toMatchVisualSelection("|\nconsectetur adipiscing elit");
    });

    it("fires keydown, beforeinput, and input events", () => {
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

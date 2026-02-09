/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { SelectionRange } from "../utils/selection-range.js";
import { userEvent } from "./user-event.js";

describe("userEvent.input", () => {
  describe("applies content changes", () => {
    it("insertText: inserts text at end", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 5, end: 5 });
      await user.input(el, " World");

      expect(el).toMatchVisualSelection("Hello World|");
    });

    it("insertText: inserts text in middle", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Helo
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 2, end: 2 });
      await user.input(el, "l");

      expect(el).toMatchVisualSelection("Hel|lo");
    });

    it("insertText: replaces selection when typing over selected text", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 6, end: 11 });
      await user.input(el, "Universe");

      expect(el).toMatchVisualSelection("Hello Universe|");
    });

    it("insertLineBreak: inserts newline with Shift+Enter", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          HelloWorld
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 5, end: 5 });
      await user.input(el, "{Shift>}{Enter}{/Shift}");

      expect(el).toMatchVisualSelection("Hello\n|World");
    });

    it("deleteContentBackward: deletes char with Backspace", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 5, end: 5 });
      await user.input(el, "{Backspace}");

      expect(el).toMatchVisualSelection("Hell|");
    });

    it("deleteContentForward: deletes char with Delete", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 0, end: 0 });
      await user.input(el, "{Delete}");

      expect(el).toMatchVisualSelection("|ello");
    });

    it("deleteWordBackward: deletes word with Option+Backspace", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 11, end: 11 });
      await user.input(el, "{Alt>}{Backspace}{/Alt}");

      expect(el).toMatchVisualSelection("Hello |");
    });

    it("deleteWordForward: deletes word with Option+Delete", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 0, end: 0 });
      await user.input(el, "{Alt>}{Delete}{/Alt}");

      expect(el).toMatchVisualSelection("| World");
    });

    it("deleteSoftLineBackward: deletes to line start with Cmd+Backspace", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 11, end: 11 });
      await user.input(el, "{Meta>}{Backspace}{/Meta}");

      expect(el).toMatchVisualSelection("|");
    });

    it.skip("deleteSoftLineForward: deletes to line end with Ctrl+K", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello World
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      SelectionRange.apply(el, { start: 0, end: 0 });
      await user.input(el, "{Control>}k{/Control}");

      expect(el).toMatchVisualSelection("|");
    });

    it("respects defaultPrevented on beforeinput", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div contentEditable suppressContentEditableWarning>
          Hello
        </div>,
      );

      const el = container.querySelector("div")!;
      expect(el).toBeTruthy();

      el.addEventListener("beforeinput", (e) => {
        e.preventDefault();
      });

      SelectionRange.apply(el, { start: 5, end: 5 });
      await user.input(el, " World");

      expect(el).toMatchVisualSelection("Hello|");
    });
  });

  describe("forwards events", () => {
    it("insertText: forwards all events on typing", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "X");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "X" }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "insertText", data: "X" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("insertLineBreak: forwards all events on Shift+Enter", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "{Shift>}{Enter}{/Shift}");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Enter", shiftKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "insertLineBreak" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteContentBackward: forwards all events on Backspace", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "{Backspace}");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Backspace" }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteContentBackward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteContentForward: forwards all events on Delete", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "{Delete}");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Delete" }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteContentForward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteWordBackward: forwards all events on Option+Backspace", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "{Alt>}{Backspace}{/Alt}");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Backspace", altKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteWordBackward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteWordForward: forwards all events on Option+Delete", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "{Alt>}{Delete}{/Alt}");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Delete", altKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteWordForward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it("deleteSoftLineBackward: forwards all events on Cmd+Backspace", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "{Meta>}{Backspace}{/Meta}");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Backspace", metaKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteSoftLineBackward" }),
      );
      expect(input).toHaveBeenCalled();
    });

    it.skip("deleteSoftLineForward: forwards all events on Ctrl+K", async () => {
      const user = userEvent.setup();
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
      await user.input(el, "{Control>}k{/Control}");

      expect(keydown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "k", ctrlKey: true }),
      );
      expect(beforeinput).toHaveBeenCalledWith(
        expect.objectContaining({ inputType: "deleteSoftLineForward" }),
      );
      expect(input).toHaveBeenCalled();
    });
  });
});

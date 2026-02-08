/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { Selection } from "./selection.js";

describe("selection utilities", () => {
  describe("Selection.maxOffset", () => {
    it("returns 0 for empty element", () => {
      const { container } = render(<p />);
      const p = container.querySelector("p")!;
      expect(Selection.maxOffset(p)).toBe(0);
    });

    it("returns text length for simple text", () => {
      const { container } = render(<p>hello</p>);
      const p = container.querySelector("p")!;
      expect(Selection.maxOffset(p)).toBe(5);
    });

    it("returns total text length for nested elements", () => {
      const { container } = render(
        <p>
          hello <strong>world</strong>!
        </p>,
      );
      const p = container.querySelector("p")!;
      expect(Selection.maxOffset(p)).toBe(12); // "hello world!"
    });
  });

  describe("Selection.read and Selection.apply", () => {
    it("sets and gets caret at start", () => {
      const { container } = render(
        <p contentEditable suppressContentEditableWarning>
          hello
        </p>,
      );
      const p = container.querySelector("p")!;

      Selection.apply(p, { start: 0, end: null });
      expect(Selection.read(p)).toEqual({ start: 0, end: null });
    });

    it("sets and gets caret at end", () => {
      const { container } = render(
        <p contentEditable suppressContentEditableWarning>
          hello
        </p>,
      );
      const p = container.querySelector("p")!;

      Selection.apply(p, { start: 5, end: null });
      expect(Selection.read(p)).toEqual({ start: 5, end: null });
    });

    it("sets and gets caret in middle", () => {
      const { container } = render(
        <p contentEditable suppressContentEditableWarning>
          hello
        </p>,
      );
      const p = container.querySelector("p")!;

      Selection.apply(p, { start: 2, end: null });
      expect(Selection.read(p)).toEqual({ start: 2, end: null });
    });

    it("sets and gets selection range", () => {
      const { container } = render(
        <p contentEditable suppressContentEditableWarning>
          hello
        </p>,
      );
      const p = container.querySelector("p")!;

      Selection.apply(p, { start: 1, end: 4 });
      expect(Selection.read(p)).toEqual({ start: 1, end: 4 });
    });

    it("sets and gets full selection", () => {
      const { container } = render(
        <p contentEditable suppressContentEditableWarning>
          hello
        </p>,
      );
      const p = container.querySelector("p")!;

      Selection.apply(p, { start: 0, end: 5 });
      expect(Selection.read(p)).toEqual({ start: 0, end: 5 });
    });

    it("returns null when selection is outside element", () => {
      const { container } = render(
        <>
          <p contentEditable suppressContentEditableWarning>
            first
          </p>
          <p contentEditable suppressContentEditableWarning>
            second
          </p>
        </>,
      );
      const [first, second] = Array.from(container.querySelectorAll("p"));

      Selection.apply(second, { start: 0, end: null });
      expect(Selection.read(first)).toBeNull();
    });

    it("handles nested elements", () => {
      const { container } = render(
        <p contentEditable suppressContentEditableWarning>
          hello <b>world</b>!
        </p>,
      );
      const p = container.querySelector("p")!;

      // position 8 is inside "world" (after "hello " = 6 chars + 2)
      Selection.apply(p, { start: 8, end: null });
      expect(Selection.read(p)).toEqual({ start: 8, end: null });
    });

    it("handles selection spanning multiple nodes", () => {
      const { container } = render(
        <p contentEditable suppressContentEditableWarning>
          hello <b>world</b>!
        </p>,
      );
      const p = container.querySelector("p")!;

      Selection.apply(p, { start: 2, end: 9 });
      expect(Selection.read(p)).toEqual({ start: 2, end: 9 });
    });

    it("works with input element", () => {
      const { container } = render(<input defaultValue="hello" />);
      const input = container.querySelector("input")!;
      input.focus();

      Selection.apply(input, { start: 2, end: null });
      expect(Selection.read(input)).toEqual({ start: 2, end: null });

      Selection.apply(input, { start: 1, end: 4 });
      expect(Selection.read(input)).toEqual({ start: 1, end: 4 });
    });

    it("works with textarea element", () => {
      const { container } = render(<textarea defaultValue="hello\nworld" />);
      const textarea = container.querySelector("textarea")!;
      textarea.focus();

      Selection.apply(textarea, { start: 3, end: 8 });
      expect(Selection.read(textarea)).toEqual({ start: 3, end: 8 });
    });

    it("focuses on an empty element", () => {
      const { container } = render(<p tabIndex={1}></p>);
      const p = container.querySelector("p")!;
      p.onfocus = jest.fn();
      Selection.apply(p, { start: 0, end: null });
      expect(p.onfocus).toHaveBeenCalled();
    });
  });

  describe("Selection.merge", () => {
    it("merges two collapsed selections", () => {
      expect(
        Selection.merge({ start: 5, end: null }, { start: 2, end: null }),
      ).toEqual({ start: 2, end: null });
    });

    it("merges collapsed with range", () => {
      expect(
        Selection.merge({ start: 5, end: null }, { start: 2, end: 8 }),
      ).toEqual({ start: 2, end: 8 });
    });

    it("merges multiple ranges", () => {
      expect(
        Selection.merge(
          { start: 5, end: 7 },
          { start: 2, end: 4 },
          { start: 8, end: 10 },
        ),
      ).toEqual({ start: 2, end: 10 });
    });
  });
});

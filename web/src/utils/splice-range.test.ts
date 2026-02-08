/**
 * @jest-environment jsdom
 */
import { SpliceRange } from "./splice-range.js";

describe("SpliceRange", () => {
  describe("SpliceRange.fromInputEvent", () => {
    it("deletes word backward from caret", () => {
      expect(
        SpliceRange.apply(
          "hello world",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", { inputType: "deleteWordBackward" }),
            "hello world",
            { start: 11, end: 11 },
          )!,
        ),
      ).toBe("hello ");
    });

    it("deletes word forward from caret", () => {
      expect(
        SpliceRange.apply(
          "hello world",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", { inputType: "deleteWordForward" }),
            "hello world",
            { start: 0, end: 0 },
          )!,
        ),
      ).toBe(" world");
    });

    it("deletes soft line backward from caret", () => {
      expect(
        SpliceRange.apply(
          "hello\nworld",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", {
              inputType: "deleteSoftLineBackward",
            }),
            "hello\nworld",
            { start: 8, end: 8 },
          )!,
        ),
      ).toBe("hello\nrld");
    });

    it("deletes soft line forward from caret", () => {
      expect(
        SpliceRange.apply(
          "hello\nworld",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", {
              inputType: "deleteSoftLineForward",
            }),
            "hello\nworld",
            { start: 6, end: 6 },
          )!,
        ),
      ).toBe("hello\n");
    });

    it("inserts text at caret", () => {
      expect(
        SpliceRange.apply(
          "hello",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", {
              inputType: "insertText",
              data: "!",
            }),
            "hello",
            { start: 5, end: 5 },
          )!,
        ),
      ).toBe("hello!");
    });

    it("replaces selection on insert text", () => {
      expect(
        SpliceRange.apply(
          "hello world",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", {
              inputType: "insertText",
              data: "there",
            }),
            "hello world",
            { start: 6, end: 11 },
          )!,
        ),
      ).toBe("hello there");
    });

    it("inserts line break at caret", () => {
      expect(
        SpliceRange.apply(
          "hello",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", { inputType: "insertLineBreak" }),
            "hello",
            { start: 5, end: 5 },
          )!,
        ),
      ).toBe("hello\n");
    });

    it("deletes selected range on cut", () => {
      expect(
        SpliceRange.apply(
          "hello world",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", { inputType: "deleteByCut" }),
            "hello world",
            { start: 6, end: 11 },
          )!,
        ),
      ).toBe("hello ");
    });

    it("deletes char backward from caret", () => {
      expect(
        SpliceRange.apply(
          "hello",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", {
              inputType: "deleteContentBackward",
            }),
            "hello",
            { start: 5, end: 5 },
          )!,
        ),
      ).toBe("hell");
    });

    it("deletes char forward from caret", () => {
      expect(
        SpliceRange.apply(
          "hello",
          SpliceRange.fromInputEvent(
            new InputEvent("beforeinput", {
              inputType: "deleteContentForward",
            }),
            "hello",
            { start: 0, end: 0 },
          )!,
        ),
      ).toBe("ello");
    });
  });

  describe("SpliceRange.fromSelectionRange & SpliceRange.toSelectionRange", () => {
    it("renders the same caret position after roundtrip", () => {
      expect({
        text: "hello",
        selection: SpliceRange.toSelectionRange(
          SpliceRange.fromSelectionRange({ start: 2, end: 2 }),
          1,
        ),
      }).toMatchVisualSelection("he|llo");
      expect({
        text: "hello",
        selection: SpliceRange.toSelectionRange(
          SpliceRange.fromSelectionRange({ start: 2, end: 2 }),
          -1,
        ),
      }).toMatchVisualSelection("he|llo");
    });

    it("places caret after inserted text on redo", () => {
      expect({
        text: SpliceRange.apply("hello", {
          offset: 2,
          deleteCount: 0,
          insert: "X",
        }),
        selection: SpliceRange.toSelectionRange(
          {
            offset: 2,
            deleteCount: 0,
            insert: "X",
          },
          1,
        ),
      }).toMatchVisualSelection("heX|llo");
    });

    it("places caret at deleted selection start on redo", () => {
      expect({
        text: SpliceRange.apply(
          "hello",
          SpliceRange.fromSelectionRange({ start: 2, end: 4 }),
        ),
        selection: SpliceRange.toSelectionRange(
          SpliceRange.fromSelectionRange({ start: 2, end: 4 }),
          1,
        ),
      }).toMatchVisualSelection("he|o");
    });
  });
});

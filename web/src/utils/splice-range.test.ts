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
            { start: 11, end: null },
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
            { start: 0, end: null },
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
            { start: 8, end: null },
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
            { start: 6, end: null },
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
            { start: 5, end: null },
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
            { start: 5, end: null },
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
            { start: 5, end: null },
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
            { start: 0, end: null },
          )!,
        ),
      ).toBe("ello");
    });
  });

  describe("SpliceRange.fromSelectionRange & SpliceRange.toSelectionRange", () => {
    it("roundtrips for collapsed selection", () => {
      const selectionRange = { start: 420, end: null };
      expect(selectionRange).toEqual(
        SpliceRange.toSelectionRange(
          SpliceRange.fromSelectionRange(selectionRange)!,
          "redo",
        ),
      );
      expect(selectionRange).toEqual(
        SpliceRange.toSelectionRange(
          SpliceRange.fromSelectionRange(selectionRange)!,
          "undo",
        ),
      );
    });
  });
});

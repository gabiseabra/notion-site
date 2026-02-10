/**
 * @jest-environment jsdom
 */
import { SpliceRange } from "./splice-range.js";

describe("SpliceRange", () => {
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

  describe("SpliceRange.applyToElement", () => {
    it("inserts text at offset in plain text", () => {
      const el = document.createElement("div");
      el.textContent = "hello world";
      SpliceRange.applyToElement(el, {
        offset: 5,
        deleteCount: 0,
        insert: "!",
      });
      expect(el.textContent).toBe("hello! world");
    });

    it("deletes text at offset", () => {
      const el = document.createElement("div");
      el.textContent = "hello world";
      SpliceRange.applyToElement(el, { offset: 5, deleteCount: 6, insert: "" });
      expect(el.textContent).toBe("hello");
    });

    it("replaces text at offset", () => {
      const el = document.createElement("div");
      el.textContent = "hello world";
      SpliceRange.applyToElement(el, {
        offset: 6,
        deleteCount: 5,
        insert: "there",
      });
      expect(el.textContent).toBe("hello there");
    });

    it("inserts inside inline element at text boundary", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <b>world</b>";
      SpliceRange.applyToElement(el, {
        offset: 6,
        deleteCount: 0,
        insert: "X",
      });
      expect(el.innerHTML).toBe("hello <b>Xworld</b>");
    });

    it("inserts inside inline element at end boundary", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b> world";
      SpliceRange.applyToElement(el, {
        offset: 5,
        deleteCount: 0,
        insert: "X",
      });
      expect(el.innerHTML).toBe("<b>helloX</b> world");
    });

    it("inserts into right element with prefer=right", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";
      SpliceRange.applyToElement(
        el,
        { offset: 5, deleteCount: 0, insert: " " },
        "right",
      );
      expect(el.innerHTML).toBe("<b>hello</b><i> world</i>");
    });

    it("inserts into left element with prefer=left", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";
      SpliceRange.applyToElement(
        el,
        { offset: 5, deleteCount: 0, insert: " " },
        "left",
      );
      expect(el.innerHTML).toBe("<b>hello </b><i>world</i>");
    });

    it("deletes from plain text into inline element", () => {
      const el = document.createElement("div");
      el.innerHTML = "hello <b>world</b>!";
      SpliceRange.applyToElement(el, { offset: 4, deleteCount: 5, insert: "" });
      expect(el.innerHTML).toBe("hell<b>ld</b>!");
    });

    it("deletes from inline element into plain text", () => {
      const el = document.createElement("div");
      el.innerHTML = "!<b>hello</b> world";
      SpliceRange.applyToElement(el, { offset: 3, deleteCount: 5, insert: "" });
      expect(el.innerHTML).toBe("!<b>he</b>orld");
    });

    it("deletes from one inline element into another", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>hello</b><i>world</i>";
      SpliceRange.applyToElement(el, { offset: 3, deleteCount: 4, insert: "" });
      expect(el.innerHTML).toBe("<b>hel</b><i>rld</i>");
    });

    it("deletes across inline element with plain text between", () => {
      const el = document.createElement("div");
      el.innerHTML = "<b>aaa</b> bbb <i>ccc</i>";
      SpliceRange.applyToElement(el, { offset: 2, deleteCount: 9, insert: "" });
      expect(el.innerHTML).toBe("<b>aa</b>");
    });

    it("deletes entire inline element from surrounding text", () => {
      const el = document.createElement("div");
      el.innerHTML = "aa<b>bbb</b>cc";
      SpliceRange.applyToElement(el, { offset: 1, deleteCount: 5, insert: "" });
      expect(el.innerHTML).toBe("ac");
    });

    it("deletes nested inline elements", () => {
      const el = document.createElement("div");
      el.innerHTML = "a<b>b<i>c</i>d</b>e";
      SpliceRange.applyToElement(el, { offset: 1, deleteCount: 3, insert: "" });
      expect(el.innerHTML).toBe("ae");
    });
  });
});

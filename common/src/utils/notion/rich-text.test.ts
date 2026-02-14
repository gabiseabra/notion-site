import { describe, expect, it } from "@jest/globals";
import { zNotion } from "../../dto/notion/schema/index.js";
import * as RTF from "./rich-text.js";
import { span } from "./wip.js";

describe("Notion.RTF", () => {
  describe("Notion.RTF.getLength", () => {
    it("returns 0 for empty array", () => {
      expect(RTF.getLength([])).toBe(0);
    });

    it("returns length of single text item", () => {
      expect(RTF.getLength([span("hello")])).toBe(5);
    });

    it("returns combined length of multiple text items", () => {
      expect(RTF.getLength([span("hello"), span(" world")])).toBe(11);
    });

    it("ignores non-text items", () => {
      expect(
        RTF.getLength([
          span("hello"),
          { type: "mention" as const, mention: {} },
          span(" world"),
        ]),
      ).toBe(11);
    });
  });

  describe("Notion.RTF.findByOffset", () => {
    it("returns null for empty array", () => {
      expect(RTF.findByOffset([], 0)).toBe(null);
    });

    it("returns null for offset beyond length", () => {
      expect(RTF.findByOffset([span("hello")], 10)).toBe(null);
    });

    it("finds item at valid offset", () => {
      for (let i = 0; i <= 5; ++i)
        expect(RTF.findByOffset([span("hello")], i)).toEqual({
          node: span("hello"),
          index: 0,
          start: 0,
          length: 5,
        });
    });

    it("finds nothing at invalid offset", () => {
      expect(RTF.findByOffset([span("hello")], -1)).toEqual(null);
      expect(RTF.findByOffset([span("hello")], 6)).toEqual(null);
    });

    it("finds correct item in multi-item array", () => {
      expect(RTF.findByOffset([span("hello"), span(" world")], 7)).toEqual({
        node: span(" world"),
        index: 1,
        start: 5,
        length: 6,
      });
    });
  });

  describe("Notion.RTF.slice", () => {
    it("returns empty array for empty input", () => {
      expect(RTF.slice([], 0, 5)).toEqual([]);
    });

    it("returns empty array when start equals end", () => {
      expect(RTF.slice([span("hello")], 2, 2)).toEqual([]);
    });

    it("slices from start", () => {
      expect(RTF.slice([span("hello")], 0, 3)).toEqual([span("hel")]);
    });

    it("slices from middle", () => {
      expect(RTF.slice([span("hello")], 1, 4)).toEqual([span("ell")]);
    });

    it("slices to end when end is undefined", () => {
      expect(RTF.slice([span("hello")], 2)).toEqual([span("llo")]);
    });

    it("preserves annotations when slicing", () => {
      expect(
        RTF.slice([span("hello", { bold: true, italic: true })], 1, 4),
      ).toEqual([span("ell", { bold: true, italic: true })]);
    });

    it("slices across multiple items", () => {
      expect(
        RTF.slice(
          [span("hello", { bold: true }), span(" world", { italic: true })],
          3,
          8,
        ),
      ).toEqual([span("lo", { bold: true }), span(" wo", { italic: true })]);
    });
  });

  describe("Notion.RTF.splice", () => {
    it("returns same array when no changes", () => {
      expect(RTF.splice([span("hello")], 0, 0, "")).toEqual([span("hello")]);
    });

    it("creates text item when inserting into empty array", () => {
      expect(RTF.splice([], 0, 0, "hello")).toEqual([span("hello")]);
    });

    it("inserts text at beginning", () => {
      expect(RTF.splice([span("world")], 0, 0, "hello ")).toEqual([
        span("hello world"),
      ]);
    });

    it("inserts text in middle", () => {
      expect(RTF.splice([span("helo")], 3, 0, "l")).toEqual([span("hello")]);
    });

    it("inserts text at end", () => {
      expect(RTF.splice([span("hello")], 5, 0, " world")).toEqual([
        span("hello world"),
      ]);
    });

    it("deletes text", () => {
      expect(RTF.splice([span("hello")], 1, 3, "")).toEqual([span("ho")]);
    });

    it("replaces text", () => {
      expect(RTF.splice([span("hello")], 1, 3, "ipp")).toEqual([span("hippo")]);
    });

    it("preserves annotations from item at insert point", () => {
      expect(
        RTF.splice([span("hello", { bold: true })], 5, 0, " world"),
      ).toEqual([span("hello world", { bold: true })]);
    });

    it("preserves structure across mixed annotations", () => {
      expect(
        RTF.splice(
          [span("he", { bold: true }), span("llo", { italic: true })],
          1,
          3,
          "",
        ),
      ).toEqual([span("h", { bold: true }), span("o", { italic: true })]);
    });
  });

  describe("Notion.RTF.normalize", () => {
    it("merges adjacent items with same annotations", () => {
      expect(
        RTF.normalize([span("hello"), span(" world"), span("! ! !")]),
      ).toEqual([span("hello world! ! !")]);
    });

    it("does not merge items with different annotations", () => {
      const rich_text = [
        span("hello", { italic: true }),
        span(" world", { italic: false }),
      ];
      expect(RTF.normalize(rich_text)).toEqual(rich_text);
    });
  });

  const toUpperCaseAsync = async (item: zNotion.rich_text.text) => ({
    ...item,
    text: { ...item.text, content: item.text.content.toUpperCase() },
  });

  describe("Notion.RTF.traverseText", () => {
    it("applies async function to text items", async () => {
      expect(await RTF.traverseText([span("hello")], toUpperCaseAsync)).toEqual(
        [span("HELLO")],
      );
    });

    it("preserves non-text items", async () => {
      const mention = { type: "mention" as const, mention: {} };

      const result = await RTF.traverseText(
        [span("hello"), mention, span("world")],
        toUpperCaseAsync,
      );

      expect(result[0]).toEqual(span("HELLO"));
      expect(result[1]).toBe(mention);
      expect(result[2]).toEqual(span("WORLD"));
    });
  });
});

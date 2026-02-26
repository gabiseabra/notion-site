import { describe, expect, it } from "@jest/globals";
import { zNotion } from "../../dto/notion/schema/index.js";
import * as RTF from "./rich-text.js";
import { a, span } from "./wip.js";

describe("Notion.RTF", () => {
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

  describe("Notion.RTF.findByRange", () => {
    it("returns empty array for empty input", () => {
      expect(RTF.findByRange([], 0, 0)).toEqual([]);
    });

    it("returns the item at offset for a zero-width range", () => {
      expect(RTF.findByRange([span("hello")], 2, 2)).toEqual([span("hello")]);
    });

    it("returns empty array when zero-width offset is past the end", () => {
      expect(RTF.findByRange([span("hello")], 10, 10)).toEqual([]);
    });

    it("returns a slice for a non-zero range", () => {
      expect(RTF.findByRange([span("hello")], 1, 4)).toEqual([span("ell")]);
    });

    it("returns a slice across multiple items for a non-zero range", () => {
      expect(
        RTF.findByRange(
          [span("hello", { bold: true }), span(" world")],
          3,
          8,
        ),
      ).toEqual([span("lo", { bold: true }), span(" wo")]);
    });
  });

  describe("Notion.RTF.findLinkRange", () => {
    it("returns null for empty input", () => {
      expect(RTF.findLinkRange([])).toBeNull();
    });

    it("returns null when offset is on a non-link item", () => {
      expect(RTF.findLinkRange([span("hello")], 2)).toBeNull();
    });

    it("returns null when offset is negative", () => {
      expect(RTF.findLinkRange([a("hello", "https://example.com")], -1)).toBeNull();
    });

    it("returns null when offset is past the end", () => {
      expect(RTF.findLinkRange([a("hello", "https://example.com")], 10)).toBeNull();
    });

    it("returns the range of a single link item", () => {
      expect(RTF.findLinkRange([a("hello", "https://example.com")], 2)).toEqual(
        { start: 0, end: 5 },
      );
    });

    it("does not expand to an adjacent item with a different url", () => {
      expect(
        RTF.findLinkRange(
          [span("x"), a("foo", "https://a.com"), a("bar", "https://b.com")],
          2,
        ),
      ).toEqual({ start: 1, end: 4 });
    });

    it("expands forwards to include adjacent items with the same url", () => {
      expect(
        RTF.findLinkRange(
          [span("x"), a("foo", "https://example.com"), a("bar", "https://example.com")],
          2,
        ),
      ).toEqual({ start: 1, end: 7 });
    });

    it("expands backwards to include adjacent items with the same url", () => {
      expect(
        RTF.findLinkRange(
          [a("foo", "https://example.com"), a("bar", "https://example.com"), span("x")],
          4,
        ),
      ).toEqual({ start: 0, end: 6 });
    });
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

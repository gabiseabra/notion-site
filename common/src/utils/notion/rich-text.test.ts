import { describe, expect, it } from "@jest/globals";
import { zNotion } from "../../dto/notion/schema/index.js";
import { span } from "../../test-utils/mock-block.js";
import {
  findRichTextItemByOffset,
  getRichTextLength,
  normalizeRichText,
  sliceRichText,
  spliceRichText,
  traverseRichTextText,
} from "./rich-text.js";

const getContent = (rich_text: zNotion.properties.rich_text_item) =>
  rich_text
    .filter((i) => i.type === "text")
    .map((i) => i.text.content)
    .join("");

describe("rich-text utilities", () => {
  describe("getRichTextLength", () => {
    it("returns 0 for empty array", () => {
      expect(getRichTextLength([])).toBe(0);
    });

    it("returns length of single text item", () => {
      expect(getRichTextLength([span("hello")])).toBe(5);
    });

    it("returns combined length of multiple text items", () => {
      expect(getRichTextLength([span("hello"), span(" world")])).toBe(11);
    });

    it("ignores non-text items", () => {
      expect(
        getRichTextLength([
          span("hello"),
          { type: "mention" as const, mention: {} },
          span(" world"),
        ]),
      ).toBe(11);
    });
  });

  describe("findRichTextItemByOffset", () => {
    it("returns null for empty array", () => {
      expect(findRichTextItemByOffset([], 0)).toBe(null);
    });

    it("returns null for offset beyond length", () => {
      expect(findRichTextItemByOffset([span("hello")], 10)).toBe(null);
    });

    it("finds item at valid offset", () => {
      const item = span("hello");
      for (let i = 0; i <= 5; ++i)
        expect(findRichTextItemByOffset([item], i)).toEqual({
          node: item,
          index: 0,
          start: 0,
          length: 5,
        });
    });

    it("finds nothing at invalid offset", () => {
      const item = span("hello");
      expect(findRichTextItemByOffset([item], -1)).toEqual(null);
      expect(findRichTextItemByOffset([item], 6)).toEqual(null);
    });

    it("finds correct item in multi-item array", () => {
      const items = [span("hello"), span(" world")];
      expect(findRichTextItemByOffset(items, 7)).toEqual({
        node: items[1],
        index: 1,
        start: 5,
        length: 6,
      });
    });
  });

  describe("sliceRichText", () => {
    it("returns empty array for empty input", () => {
      expect(sliceRichText([], 0, 5)).toEqual([]);
    });

    it("returns empty array when start equals end", () => {
      expect(sliceRichText([span("hello")], 2, 2)).toEqual([]);
    });

    it("slices from start", () => {
      expect(sliceRichText([span("hello")], 0, 3)).toEqual([span("hel")]);
    });

    it("slices from middle", () => {
      expect(sliceRichText([span("hello")], 1, 4)).toEqual([span("ell")]);
    });

    it("slices to end when end is undefined", () => {
      expect(sliceRichText([span("hello")], 2)).toEqual([span("llo")]);
    });

    it("preserves annotations when slicing", () => {
      expect(
        sliceRichText([span("hello", { bold: true, italic: true })], 1, 4),
      ).toEqual([span("ell", { bold: true, italic: true })]);
    });

    it("slices across multiple items", () => {
      expect(
        sliceRichText(
          [span("hello", { bold: true }), span(" world", { italic: true })],
          3,
          8,
        ),
      ).toEqual([span("lo", { bold: true }), span(" wo", { italic: true })]);
    });
  });

  describe("spliceRichText", () => {
    it("returns same array when no changes", () => {
      const rich_text = [span("hello")];
      expect(spliceRichText(rich_text, 0, 0, "")).toBe(rich_text);
    });

    it("creates text item when inserting into empty array", () => {
      expect(getContent(spliceRichText([], 0, 0, "hello"))).toBe("hello");
    });

    it("inserts text at beginning", () => {
      expect(getContent(spliceRichText([span("world")], 0, 0, "hello "))).toBe(
        "hello world",
      );
    });

    it("inserts text in middle", () => {
      expect(getContent(spliceRichText([span("helo")], 3, 0, "l"))).toBe(
        "hello",
      );
    });

    it("inserts text at end", () => {
      expect(getContent(spliceRichText([span("hello")], 5, 0, " world"))).toBe(
        "hello world",
      );
    });

    it("deletes text", () => {
      expect(getContent(spliceRichText([span("hello")], 1, 3, ""))).toBe("ho");
    });

    it("replaces text", () => {
      expect(getContent(spliceRichText([span("hello")], 1, 3, "ipp"))).toBe(
        "hippo",
      );
    });

    it("preserves annotations from item at insert point", () => {
      const result = spliceRichText(
        [span("hello", { bold: true })],
        5,
        0,
        " world",
      );
      expect(result[result.length - 1]).toMatchObject({
        annotations: { bold: true },
      });
    });
  });

  describe("normalizeRichText", () => {
    it("returns empty array for empty input", () => {
      expect(normalizeRichText([])).toEqual([]);
    });

    it("returns same items when no merging needed", () => {
      const rich_text = [
        span("hello", { bold: true }),
        span(" world", { italic: true }),
      ];
      expect(normalizeRichText(rich_text)).toEqual(rich_text);
    });

    it("merges adjacent items with same annotations", () => {
      expect(
        normalizeRichText([span("hello"), span(" world"), span("! ! !")]),
      ).toEqual([span("hello world! ! !")]);
    });

    it("does not merge items with different annotations", () => {
      const rich_text = [
        span("hello", { italic: true }),
        span(" world", { italic: false }),
      ];
      expect(normalizeRichText(rich_text)).toEqual(rich_text);
    });
  });

  const toUpperCaseAsync = async (item: zNotion.properties.text) => ({
    ...item,
    text: { ...item.text, content: item.text.content.toUpperCase() },
  });

  describe("traverseRichTextText", () => {
    it("applies async function to text items", async () => {
      expect(
        await traverseRichTextText([span("hello")], toUpperCaseAsync),
      ).toEqual([span("HELLO")]);
    });

    it("preserves non-text items", async () => {
      const mention = { type: "mention" as const, mention: {} };

      const result = await traverseRichTextText(
        [span("hello"), mention, span("world")],
        toUpperCaseAsync,
      );

      expect(result[0]).toEqual(span("HELLO"));
      expect(result[1]).toBe(mention);
      expect(result[2]).toEqual(span("WORLD"));
    });
  });
});

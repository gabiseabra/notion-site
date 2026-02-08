import { describe, expect, it } from "@jest/globals";
import { zNotion } from "../../dto/notion/schema/index.js";
import * as RTF from "./rich-text.js";
import { span } from "./wip.js";

const getContent = (rich_text: zNotion.rich_text.rich_text_item) =>
  rich_text
    .filter((i) => i.type === "text")
    .map((i) => i.text.content)
    .join("");

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
      const item = span("hello");
      for (let i = 0; i <= 5; ++i)
        expect(RTF.findByOffset([item], i)).toEqual({
          node: item,
          index: 0,
          start: 0,
          length: 5,
        });
    });

    it("finds nothing at invalid offset", () => {
      const item = span("hello");
      expect(RTF.findByOffset([item], -1)).toEqual(null);
      expect(RTF.findByOffset([item], 6)).toEqual(null);
    });

    it("finds correct item in multi-item array", () => {
      const items = [span("hello"), span(" world")];
      expect(RTF.findByOffset(items, 7)).toEqual({
        node: items[1],
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
      const rich_text = [span("hello")];
      expect(RTF.splice(rich_text, 0, 0, "")).toBe(rich_text);
    });

    it("creates text item when inserting into empty array", () => {
      expect(getContent(RTF.splice([], 0, 0, "hello"))).toBe("hello");
    });

    it("inserts text at beginning", () => {
      expect(getContent(RTF.splice([span("world")], 0, 0, "hello "))).toBe(
        "hello world",
      );
    });

    it("inserts text in middle", () => {
      expect(getContent(RTF.splice([span("helo")], 3, 0, "l"))).toBe("hello");
    });

    it("inserts text at end", () => {
      expect(getContent(RTF.splice([span("hello")], 5, 0, " world"))).toBe(
        "hello world",
      );
    });

    it("deletes text", () => {
      expect(getContent(RTF.splice([span("hello")], 1, 3, ""))).toBe("ho");
    });

    it("replaces text", () => {
      expect(getContent(RTF.splice([span("hello")], 1, 3, "ipp"))).toBe(
        "hippo",
      );
    });

    it("preserves annotations from item at insert point", () => {
      const result = RTF.splice(
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

  describe("Notion.RTF.normalize", () => {
    it("returns empty array for empty input", () => {
      expect(RTF.normalize([])).toEqual([]);
    });

    it("returns same items when no merging needed", () => {
      const rich_text = [
        span("hello", { bold: true }),
        span(" world", { italic: true }),
      ];
      expect(RTF.normalize(rich_text)).toEqual(rich_text);
    });

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

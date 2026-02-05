import { zNotion } from "../../dto/notion/schema/index.js";
import { hasPropertyValue } from "../guards.js";

type RichText = zNotion.properties.rich_text_item;
type RichTextItemType = zNotion.properties.rich_text_item[number]["type"];
type RichTextItem<T extends RichTextItemType = RichTextItemType> = Extract<
  zNotion.properties.rich_text_item[number],
  { type: T }
>;

export function traverseRichTextText(
  rich_text: RichText,
  f: (item: RichTextItem<"text">) => Promise<RichTextItem<"text">>,
) {
  return Promise.all(
    rich_text.map(async (item) => {
      if (item.type === "text") return f(item);
      return item;
    }),
  );
}

export function findRichTextItemByOffset(rich_text: RichText, offset: number) {
  let index = 0,
    start = 0;

  if (offset < 0) return null;

  for (const node of rich_text) {
    if (node.type !== "text") continue;

    const length = node.text.content.length;

    if (start + length >= offset) return { node, index, start, length };

    index++;
    start += length;
  }

  return null;
}

export function getRichTextContent(rich_text: RichText) {
  return rich_text
    .filter(hasPropertyValue("type", "text"))
    .map(({ text }) => text.content)
    .join("");
}

export function getRichTextLength(rich_text: RichText) {
  return rich_text.reduce((acc, item) => {
    if (item.type !== "text") return acc;
    return acc + item.text.content.length;
  }, 0);
}

/**
 * Extracts a portion of rich text by character offset, preserving annotations.
 */
export function sliceRichText(
  rich_text: RichText,
  start: number,
  end?: number,
): RichText {
  if (end === start) return [];

  const startItem = findRichTextItemByOffset(rich_text, start);
  const endItem = end ? findRichTextItemByOffset(rich_text, end) : undefined;

  if (!startItem) return [];

  return [
    replaceTextContent(startItem.node, (content) =>
      content.slice(
        start - startItem.start,
        end && endItem && endItem.index === startItem.index
          ? Math.min(startItem.length, end - startItem.start)
          : undefined,
      ),
    ),
    ...(endItem && endItem.index === startItem.index
      ? []
      : rich_text.slice(
          startItem.index + 1,
          endItem ? endItem.index : undefined,
        )),
    ...(!endItem || endItem.index === startItem.index
      ? []
      : [
          replaceTextContent(endItem.node, (content) =>
            content.slice(0, (end ?? 0) - endItem.start),
          ),
        ]),
  ].filter((item) => !(item.type === "text" && item.text.content.length === 0));
}

/**
 * Applies a text delta (insert/delete) to rich text, preserving annotations.
 */
export function spliceRichText(
  rich_text: RichText,
  offset: number,
  deleteCount: number,
  insert: string,
): RichText {
  if (deleteCount === 0 && insert === "") return rich_text;

  if (getRichTextLength(rich_text) === 0) {
    if (insert === "") return [];
    return [replaceTextContent(default_text_item, () => insert)];
  }

  const length = getRichTextLength(rich_text);

  // Clamp offset to valid range
  const safeOffset = Math.max(0, Math.min(offset, length));
  const safeEnd = Math.min(safeOffset + deleteCount, length);

  // Get the slices before and after the affected range
  const before = safeOffset > 0 ? sliceRichText(rich_text, 0, safeOffset) : [];
  const after =
    safeEnd < length ? sliceRichText(rich_text, safeEnd, length) : [];

  // If inserting, inherit annotations from the item at the insert point
  let insertItems: RichText = [];
  if (insert !== "") {
    const itemAtOffset = findRichTextItemByOffset(rich_text, safeOffset);

    insertItems = [
      replaceTextContent(itemAtOffset?.node ?? default_text_item, () => insert),
    ];
  }

  return normalizeRichText([...before, ...insertItems, ...after]);
}

export function normalizeRichText(rich_text: RichText) {
  return rich_text.reduce<RichText>((acc, item) => {
    const last = acc[acc.length - 1];

    if (
      last &&
      last.type === "text" &&
      item.type === "text" &&
      richTextItemEquals(
        replaceTextContent(last, () => ""),
        replaceTextContent(item, () => ""),
      )
    ) {
      last.text.content += item.text.content;
    } else {
      acc.push(item);
    }

    return acc;
  }, []);
}

function richTextItemEquals(a: RichTextItem, b: RichTextItem) {
  return a.type === "text" && b.type === "text"
    ? a.text.content === b.text.content &&
        a.text.link?.url === b.text.link?.url &&
        a.annotations.bold === b.annotations.bold &&
        a.annotations.code === b.annotations.code &&
        a.annotations.italic === b.annotations.italic &&
        a.annotations.color === b.annotations.color &&
        a.annotations.underline === b.annotations.underline &&
        a.annotations.strikethrough === b.annotations.strikethrough
    : a.type === b.type;
}

function replaceTextContent(
  item: RichTextItem<"text">,
  f: (content: string) => string,
): RichTextItem<"text"> {
  return {
    ...item,
    text: { ...item.text, content: f(item.text.content) },
  };
}

const default_text_item: RichTextItem<"text"> = {
  type: "text",
  text: { content: "", link: null },
  annotations: {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: "default",
  },
};

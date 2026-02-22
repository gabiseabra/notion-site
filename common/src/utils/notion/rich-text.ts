import { zNotion } from "../../dto/notion/schema/index.js";
import { hasPropertyValue, isNonNullable } from "../guards.js";

export type RichText = zNotion.rich_text.rich_text_item;

export function traverseText(
  rich_text: RichText,
  f: (item: Item<"text">) => Promise<Item<"text">>,
) {
  return Promise.all(
    rich_text.map(async (item) => {
      if (item.type === "text") return f(item);
      return item;
    }),
  );
}

export function findByOffset(rich_text: RichText, offset: number) {
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

export function findByRange(rich_text: RichText, start: number, end: number) {
  return start === end
    ? [findByOffset(rich_text, start)?.node].filter(isNonNullable)
    : slice(rich_text, start, end);
}

export function getContent(rich_text: RichText) {
  return rich_text
    .filter(hasPropertyValue("type", "text"))
    .map(({ text }) => text.content)
    .join("");
}

/**
 * @deprecated use `Notion.RTF.getContent(rich_text).length` instead
 */
export function getLength(rich_text: RichText) {
  return rich_text.reduce((acc, item) => {
    if (item.type !== "text") return acc;
    return acc + item.text.content.length;
  }, 0);
}

/**
 * Extracts a portion of rich text by character offset, preserving annotations.
 */
export function slice(
  rich_text: RichText,
  start: number,
  end?: number,
): RichText {
  if (end === start) return [];

  const startItem = findByOffset(rich_text, start);
  const endItem = end ? findByOffset(rich_text, end) : undefined;

  if (!startItem) return [];

  return normalize(
    [
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
    ].filter(
      (item) => !(item.type === "text" && item.text.content.length === 0),
    ),
  );
}

/**
 * Applies a text delta (insert/delete) to rich text, preserving annotations.
 */
export function splice(
  rich_text: RichText,
  offset: number,
  deleteCount: number,
  insert: string,
): RichText {
  if (deleteCount === 0 && insert === "") return rich_text;

  if (getLength(rich_text) === 0) {
    if (insert === "") return [];
    return [replaceTextContent(empty_text, () => insert)];
  }

  const length = getLength(rich_text);

  // Clamp offset to valid range
  const safeOffset = Math.max(0, Math.min(offset, length));
  const safeEnd = Math.min(safeOffset + deleteCount, length);

  // Get the slices before and after the affected range
  const before = safeOffset > 0 ? slice(rich_text, 0, safeOffset) : [];
  const after = safeEnd < length ? slice(rich_text, safeEnd, length) : [];

  // If inserting, inherit annotations from the item at the insert point
  let insertItems: RichText = [];
  if (insert !== "") {
    const itemAtOffset = findByOffset(rich_text, safeOffset);

    insertItems = [
      replaceTextContent(itemAtOffset?.node ?? empty_text, () => insert),
    ];
  }

  return normalize([...before, ...insertItems, ...after]);
}

export function normalize(rich_text: RichText) {
  return rich_text.reduce<RichText>((acc, item) => {
    const last = acc[acc.length - 1];

    if (
      last &&
      last.type === "text" &&
      item.type === "text" &&
      itemEquals(
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

/** Item stuff */

export type ItemType = zNotion.rich_text.rich_text_item[number]["type"];
export type Item<T extends ItemType = ItemType> = Extract<
  zNotion.rich_text.rich_text_item[number],
  { type: T }
>;

export function itemEquals(a: Item, b: Item) {
  return a.type === "text" && b.type === "text"
    ? a.text.content === b.text.content &&
        annotationsEquals(a.annotations, b.annotations)
    : a.type === b.type;
}

function replaceTextContent(
  item: Item<"text">,
  f: (content: string) => string,
): Item<"text"> {
  return {
    ...item,
    text: { ...item.text, content: f(item.text.content) },
  };
}

/** Annotations stuff */

export type Annotations = zNotion.rich_text.annotations;

export function annotationsEquals(a: Annotations, b: Annotations) {
  return (
    a.bold === b.bold &&
    a.code === b.code &&
    a.italic === b.italic &&
    a.color === b.color &&
    a.underline === b.underline &&
    a.strikethrough === b.strikethrough
  );
}

export function isItemRedacted({ text: { link } }: Item<"text">) {
  return link?.url === "REDACTED";
}

export function isItemAnnotated(item: Item<"text">, a: Partial<Annotations>) {
  return (
    (typeof a.bold !== "undefined" && a.bold === item.annotations.bold) ||
    (typeof a.code !== "undefined" && a.code === item.annotations.code) ||
    (typeof a.italic !== "undefined" && a.italic === item.annotations.italic) ||
    (typeof a.color !== "undefined" && a.color === item.annotations.color) ||
    (typeof a.underline !== "undefined" &&
      a.underline === item.annotations.underline) ||
    (typeof a.strikethrough !== "undefined" &&
      a.strikethrough === item.annotations.strikethrough)
  );
}

export function setAnnotations(
  rich_text: RichText,
  a: Partial<Annotations>,
  start: number,
  end: number,
): RichText {
  const before = slice(rich_text, 0, start);
  const middle = slice(rich_text, start, end).map((item) =>
    item.type === "text"
      ? {
          ...item,
          annotations: {
            ...item.annotations,
            ...a,
          },
        }
      : item,
  );
  const after = slice(rich_text, end);

  return normalize([...before, ...middle, ...after]);
}

export const empty_text: Item<"text"> = {
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

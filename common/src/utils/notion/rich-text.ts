import { zNotion } from "../../dto/notion/schema/index.js";
import { hasPropertyValue, isNonNullable } from "../guards.js";
import { NonEmpty } from "../non-empty.js";
import { keys, omitUndefined } from "../object.js";

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

export function getContent(rich_text: RichText) {
  return foldText(
    rich_text,
    (content, item) => content + item.text.content,
    "",
  );
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

  const startItem = _findByOffset(rich_text, start);
  const endItem = end ? _findByOffset(rich_text, end) : undefined;

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

  const length = getContent(rich_text).length;

  if (length === 0) {
    if (insert === "") return [];
    return [replaceTextContent(empty_text, () => insert)];
  }

  const start = Math.max(0, Math.min(offset, length));
  const end = Math.min(start + deleteCount, length);

  // Get the slices before and after the affected range
  const before = start > 0 ? slice(rich_text, 0, start) : [];
  const after = end < length ? slice(rich_text, end, length) : [];

  // If inserting, inherit annotations from the selected range
  const insertItems: RichText = (() => {
    if (insert === "") return [];

    const currentText = _findByOffset(rich_text, start)?.node;
    const defaultAnnotations =
      currentText?.annotations ?? empty_text.annotations;

    return [
      {
        type: "text",
        text: {
          content: insert,
          link: currentText?.text.link ?? null,
        },
        annotations: {
          ...defaultAnnotations,
          ...getAnnotations(rich_text, start, end),
        },
      },
    ];
  })();

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
        annotationsEquals(a.annotations, b.annotations) &&
        (a.text.link?.url ?? null) === (b.text.link?.url ?? null)
    : a.type === b.type;
}

export function foldText<T>(
  rich_text: RichText,
  f: (acc: T, item: Item<"text">, offset: number, index: number) => T,
  initialValue: T,
) {
  return rich_text.reduce(
    (acc, item, index) => {
      if (item.type !== "text") return acc;
      return {
        value: f(acc.value, item, acc.offset, index),
        offset: acc.offset + item.text.content.length,
      };
    },
    { value: initialValue, offset: 0 },
  ).value;
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

export function getAnnotations(
  rich_text: RichText,
  start: number,
  end: number,
): Partial<Annotations> {
  if (start === end) {
    return _findByOffset(rich_text, start)?.node.annotations ?? {};
  }

  const textItems = slice(rich_text, start, end).filter(
    hasPropertyValue("type", "text"),
  );
  const first = textItems[0]?.annotations;
  if (!first) return {};

  return omitUndefined(
    Object.fromEntries(
      keys(first).map(
        (key) =>
          [
            key,
            textItems.every((item) => item.annotations[key] === first[key])
              ? first[key]
              : undefined,
          ] as const,
      ),
    ),
  );
}

/** Links */

export type Link = Item<"text">["text"]["link"];

export function setLink(
  rich_text: RichText,
  link: Link,
  start: number,
  end: number,
): RichText {
  const before = slice(rich_text, 0, start);
  const middle = slice(rich_text, start, end).map((item) =>
    item.type === "text"
      ? {
          ...item,
          text: {
            ...item.text,
            link,
          },
        }
      : item,
  );
  const after = slice(rich_text, end);

  return normalize([...before, ...middle, ...after]);
}

export function getLink(
  rich_text: RichText,
  start: number,
  end: number,
): Link | undefined {
  const textItems = findByRange(rich_text, start, end).filter(
    hasPropertyValue("type", "text"),
  );
  if (!NonEmpty.isNonEmpty(textItems)) return null;

  const first = textItems[0].text.link;
  const isSameLink = textItems.every(
    (item) => item.text.link?.url === first?.url,
  );

  return isSameLink ? first : undefined;
}

/** Methods to find chunks of text */

function _findByOffset(rich_text: RichText, offset: number) {
  if (offset < 0) return null;

  return foldText<{
    node: Item<"text">;
    index: number;
    start: number;
    length: number;
  } | null>(
    rich_text,
    (acc, node, start, index) => {
      const length = node.text.content.length;
      return !acc && start + length >= offset
        ? { node, index, start, length }
        : acc;
    },
    null,
  );
}

export function findByRange(rich_text: RichText, start: number, end: number) {
  return start === end
    ? [_findByOffset(rich_text, start)?.node].filter(isNonNullable)
    : slice(rich_text, start, end);
}

/**
 * Find the range that includes all items maching same the link in the given offset.
 */
export function findLinkRange(
  rich_text: RichText,
  offset: number = 0,
): { start: number; end: number } | null {
  const target = _findByOffset(rich_text, offset);
  const link = target?.node.text.link;

  if (!target || !link) return null;

  const range = {
    start: target.start,
    end: target.start + target.node.text.content.length,
  };

  for (let i = target.index; i > 0; --i) {
    const text = rich_text[i];
    if (!(text && text.type === "text" && text.text.link?.url === link.url))
      break;
    range.start -= text.text.content.length;
  }

  for (let i = target.index; i < rich_text.length; ++i) {
    const text = rich_text[i];
    if (!(text && text.type === "text" && text.text.link?.url === link.url))
      break;
    range.start += text.text.content.length;
  }

  return range;
}

/** Default */

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

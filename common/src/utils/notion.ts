import { match } from "ts-pattern";
import { zNotion } from "../dto/notion/schema/index.js";
import { hasPropertyValue } from "./guards.js";

export function titleToString({ title }: zNotion.properties.title) {
  return (
    title
      .filter(hasPropertyValue("type", "text"))
      .map((text) => text.text.content)
      .join(" ") || undefined
  );
}

export function isRedacted({ text: { link } }: zNotion.properties.text) {
  return link?.url === "REDACTED";
}

export async function mapBlockRichText(
  block: zNotion.blocks.block,
  fn: (
    rich_text: zNotion.properties.rich_text_item,
  ) => Promise<zNotion.properties.rich_text_item>,
): Promise<zNotion.blocks.block> {
  return match(block)
    .with({ type: "paragraph" }, async (block) => ({
      ...block,
      paragraph: {
        ...block.paragraph,
        rich_text: await fn(block.paragraph.rich_text),
      },
    }))
    .with({ type: "heading_1" }, async (block) => ({
      ...block,
      heading_1: {
        ...block.heading_1,
        rich_text: await fn(block.heading_1.rich_text),
      },
    }))
    .with({ type: "heading_2" }, async (block) => ({
      ...block,
      heading_2: {
        ...block.heading_2,
        rich_text: await fn(block.heading_2.rich_text),
      },
    }))
    .with({ type: "heading_3" }, async (block) => ({
      ...block,
      heading_3: {
        ...block.heading_3,
        rich_text: await fn(block.heading_3.rich_text),
      },
    }))
    .with({ type: "bulleted_list_item" }, async (block) => ({
      ...block,
      bulleted_list_item: {
        ...block.bulleted_list_item,
        rich_text: await fn(block.bulleted_list_item.rich_text),
      },
    }))
    .with({ type: "numbered_list_item" }, async (block) => ({
      ...block,
      numbered_list_item: {
        ...block.numbered_list_item,
        rich_text: await fn(block.numbered_list_item.rich_text),
      },
    }))
    .with({ type: "quote" }, async (block) => ({
      ...block,
      quote: {
        ...block.quote,
        rich_text: await fn(block.quote.rich_text),
      },
    }))
    .otherwise((block) => block);
}

export async function mapBlockText(
  block: zNotion.blocks.block,
  fn: (text: zNotion.properties.text) => Promise<zNotion.properties.text>,
): Promise<zNotion.blocks.block> {
  return mapBlockRichText(block, (rich_text) =>
    Promise.all(
      rich_text.map(async (part) => {
        if (part.type === "text") return fn(part);
        return part;
      }),
    ),
  );
}

type TextReplacer = (
  url: string,
  text: zNotion.properties.text,
) => string | Promise<string>;

export const replaceTextUrl =
  (replacer: TextReplacer) => async (text: zNotion.properties.text) => {
    if (text.text.link === null) return text;

    return {
      ...text,
      text: {
        ...text.text,
        link: { url: await replacer(text.text.link.url, text) },
      },
    };
  };

export const replaceTextContent =
  (replacer: TextReplacer) => async (text: zNotion.properties.text) => {
    return {
      ...text,
      text: {
        ...text.text,
        content: await replacer(text.text.content, text),
      },
    };
  };

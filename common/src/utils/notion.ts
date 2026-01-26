import { match } from "ts-pattern";
import { zNotion } from "../dto/notion/schema/index.js";
import { hasPropertyValue } from "./guards.js";

export type UrlReplacer = (url: string) => Promise<string>;

export function titleToString({ title }: zNotion.properties.title) {
  return (
    title
      .filter(hasPropertyValue("type", "text"))
      .map((text) => text.text.content)
      .join(" ") || undefined
  );
}

export async function replaceBlockUrls(
  block: zNotion.blocks.block,
  replacer: UrlReplacer,
): Promise<zNotion.blocks.block> {
  return match(block)
    .with({ type: "paragraph" }, async (block) => ({
      ...block,
      paragraph: {
        ...block.paragraph,
        rich_text: await replaceRichTextUrls(
          block.paragraph.rich_text,
          replacer,
        ),
      },
    }))
    .with({ type: "heading_1" }, async (block) => ({
      ...block,
      heading_1: {
        ...block.heading_1,
        rich_text: await replaceRichTextUrls(
          block.heading_1.rich_text,
          replacer,
        ),
      },
    }))
    .with({ type: "heading_2" }, async (block) => ({
      ...block,
      heading_2: {
        ...block.heading_2,
        rich_text: await replaceRichTextUrls(
          block.heading_2.rich_text,
          replacer,
        ),
      },
    }))
    .with({ type: "heading_3" }, async (block) => ({
      ...block,
      heading_3: {
        ...block.heading_3,
        rich_text: await replaceRichTextUrls(
          block.heading_3.rich_text,
          replacer,
        ),
      },
    }))
    .with({ type: "bulleted_list_item" }, async (block) => ({
      ...block,
      bulleted_list_item: {
        ...block.bulleted_list_item,
        rich_text: await replaceRichTextUrls(
          block.bulleted_list_item.rich_text,
          replacer,
        ),
      },
    }))
    .with({ type: "numbered_list_item" }, async (block) => ({
      ...block,
      numbered_list_item: {
        ...block.numbered_list_item,
        rich_text: await replaceRichTextUrls(
          block.numbered_list_item.rich_text,
          replacer,
        ),
      },
    }))
    .with({ type: "quote" }, async (block) => ({
      ...block,
      quote: {
        ...block.quote,
        rich_text: await replaceRichTextUrls(block.quote.rich_text, replacer),
      },
    }))
    .otherwise((block) => block);
}

async function replaceRichTextUrls(
  richText: zNotion.properties.rich_text_item,
  replacer: UrlReplacer,
) {
  return Promise.all(
    richText.map(async (item) => {
      if (item.type !== "text" || item.text.link === null) {
        return item;
      }

      return {
        ...item,
        text: {
          ...item.text,
          link: { url: await replacer(item.text.link.url) },
        },
      };
    }),
  );
}

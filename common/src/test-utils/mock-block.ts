import { zNotion } from "../dto/notion/schema/index.js";

export function p(
  id: string,
  ...rich_text: zNotion.properties.rich_text_item
): zNotion.blocks.block {
  return {
    ...zNotion.wip.wip_block({
      type: "paragraph",
      paragraph: {
        color: "default",
        rich_text,
      },
    }),
    id,
  };
}

export function span(
  content: string,
  annotations?: Partial<zNotion.properties.annotations>,
) {
  return {
    type: "text",
    text: { content, link: null },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
      ...annotations,
    },
  } as const;
}

export function a(content: string, url: string) {
  return {
    type: "text",
    text: { content, link: { url } },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
  } as const;
}

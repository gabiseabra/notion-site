import { z } from "zod";
import { api_color } from "./primitives.js";
import { rich_text_item } from "./properties.js";
import { block_id, page_id } from "./references.js";

export const paragraph = z.object({
  type: z.literal("paragraph"),
  paragraph: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});
export type paragraph = z.infer<typeof paragraph>;

export const heading_1 = z.object({
  type: z.literal("heading_1"),
  heading_1: z.object({
    rich_text: rich_text_item,
    color: api_color,
    is_toggleable: z.boolean(),
  }),
});
export type heading_1 = z.infer<typeof heading_1>;

export const heading_2 = z.object({
  type: z.literal("heading_2"),
  heading_2: z.object({
    rich_text: rich_text_item,
    color: api_color,
    is_toggleable: z.boolean(),
  }),
});
export type heading_2 = z.infer<typeof heading_2>;

export const heading_3 = z.object({
  type: z.literal("heading_3"),
  heading_3: z.object({
    rich_text: rich_text_item,
    color: api_color,
    is_toggleable: z.boolean(),
  }),
});
export type heading_3 = z.infer<typeof heading_3>;

export const bulleted_list_item = z.object({
  type: z.literal("bulleted_list_item"),
  bulleted_list_item: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});
export type bulleted_list_item = z.infer<typeof bulleted_list_item>;

export const numbered_list_item = z.object({
  type: z.literal("numbered_list_item"),
  numbered_list_item: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});
export type numbered_list_item = z.infer<typeof numbered_list_item>;

export const quote = z.object({
  type: z.literal("quote"),
  quote: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});
export type quote = z.infer<typeof quote>;

export const divider = z.object({
  type: z.literal("divider"),
});
export type divider = z.infer<typeof divider>;

export const link_to_page = z.object({
  type: z.literal("link_to_page"),
  link_to_page: page_id,
});
export type link_to_page = z.infer<typeof link_to_page>;

export const child_page = z.object({
  type: z.literal("child_page"),
  child_page: z.object({ title: z.string() }),
});
export type child_page = z.infer<typeof child_page>;

const base_block_shape = {
  id: z.string(),
  parent: z.union([page_id, block_id]),
  has_children: z.boolean(),
};

export const block = z.union([
  paragraph.extend(base_block_shape),
  heading_1.extend(base_block_shape),
  heading_2.extend(base_block_shape),
  heading_3.extend(base_block_shape),
  bulleted_list_item.extend(base_block_shape),
  numbered_list_item.extend(base_block_shape),
  divider.extend(base_block_shape),
  quote.extend(base_block_shape),
  link_to_page.extend(base_block_shape),
  child_page.extend(base_block_shape),
  z.object(base_block_shape).transform((block) => ({
    type: "unsupported_block" as const,
    ...block,
  })),
]);
export type block = z.infer<typeof block>;

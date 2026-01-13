/**
 * @module @notion-site/common/dto/notion/schema.js
 * The goal is to provide a stable DTO layer between the API and web packages.
 * This module defines the shared Zod schemas and TypeScript types used to validate and type Notion API data across the
 * project. It is a deliberately partial model: it mirrors the Notion API where needed, but it does not aim for full
 * coverage, and several shapes are simplified or unsupported.
 */
import { z } from "zod";

// enums

export const color = z.enum([
  "default",
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
]);
export type color = z.infer<typeof color>;

const background_color = z.enum([
  "default_background",
  "gray_background",
  "brown_background",
  "orange_background",
  "yellow_background",
  "green_background",
  "blue_background",
  "purple_background",
  "pink_background",
  "red_background",
]);
export type background_color = z.infer<typeof background_color>;

export const api_color = z.union([color, background_color]);
export type api_color = z.infer<typeof api_color>;

// icons

export const external = z.object({
  type: z.literal("external"),
  external: z.object({
    url: z.string(),
  }),
});
export type external = z.infer<typeof external>;

export const emoji = z.object({
  type: z.literal("emoji"),
  emoji: z.string(),
});
export type emoji = z.infer<typeof emoji>;

export const custom_emoji = z.object({
  type: z.literal("custom_emoji"),
  custom_emoji: z.object({
    name: z.string(),
    url: z.string(),
  }),
});
export type custom_emoji = z.infer<typeof custom_emoji>;

export const file = z.object({
  type: z.literal("file"),
  file: z.object({
    url: z.string(),
  }),
});
export type file = z.infer<typeof file>;

export const icon = z.union([external, emoji, custom_emoji, file]);
export type icon = z.infer<typeof icon>;

export const cover = z.union([external, file]);
export type cover = z.infer<typeof cover>;

// unsupported nodes

export const mention = z.object({ type: z.literal("mention") });
export const equation = z.object({ type: z.literal("equation") });

// reference types

export const database_id = z.object({
  type: z.literal("database_id"),
  database_id: z.string(),
});
export type database_id = z.infer<typeof database_id>;

export const page_id = z.object({
  type: z.literal("page_id"),
  page_id: z.string(),
});
export type page_id = z.infer<typeof page_id>;

export const block_id = z.object({
  type: z.literal("block_id"),
  block_id: z.string(),
});
export type block_id = z.infer<typeof block_id>;

export const workspace = z.object({
  type: z.literal("workspace"),
});
export type workspace = z.infer<typeof workspace>;

// property types

export const number = z.object({
  type: z.literal("number"),
  number: z.number().nullable(),
});
export type _number = z.infer<typeof number>;

export const annotations = z.object({
  bold: z.boolean(),
  italic: z.boolean(),
  strikethrough: z.boolean(),
  underline: z.boolean(),
  code: z.boolean(),
  color: api_color,
});
export type annotations = z.infer<typeof annotations>;

export const text = z.object({
  type: z.literal("text"),
  text: z.object({
    content: z.string(),
    link: z.object({ url: z.string() }).nullable(),
  }),
  annotations,
});
export type text = z.infer<typeof text>;

export const rich_text_item = z.union([text, mention, equation]).array();
export type rich_text_item = z.infer<typeof rich_text_item>;

export const rich_text = z.object({
  type: z.literal("rich_text"),
  rich_text: rich_text_item,
});
export type rich_text = z.infer<typeof rich_text>;

export const title = z.object({
  type: z.literal("title"),
  title: rich_text_item,
});
export type title = z.infer<typeof title>;

export function status<T extends [string, ...string[]]>(options: T) {
  return z.object({
    type: z.literal("status"),
    status: z
      .object({
        name: z.enum(options),
        color: color,
      })
      .nullable(),
  });
}

export const _status = z.object({
  type: z.literal("status"),
  status: z
    .object({
      name: z.string(),
      color: color,
    })
    .nullable(),
});

export type status<T extends string> = {
  type: "status";
  status: {
    name: T;
    color: color;
  };
};

export const _select = z.object({
  type: z.literal("select"),
  select: z
    .object({
      name: z.string(),
      color: color,
    })
    .nullable(),
});

export function select<T extends [string, ...string[]]>(options: T) {
  return z.object({
    type: z.literal("select"),
    select: z
      .object({
        name: z.enum(options),
        color: color,
      })
      .nullable(),
  });
}

export type select<T extends string> = {
  type: "select";
  select: {
    name: T;
    color: color;
  } | null;
};

export const _multi_select = z.object({
  type: z.literal("multi_select"),
  multi_select: z
    .object({
      name: z.string(),
      color: color,
    })
    .array(),
});

export function multi_select<T extends [string, ...string[]]>(options: T) {
  return z.object({
    type: z.literal("multi_select"),
    multi_select: z
      .object({
        name: z.enum(options),
        color: color,
      })
      .array(),
  });
}

export type multi_select<T extends string> = {
  type: "multi_select";
  multi_select: {
    name: T;
    color: color;
  }[];
};

export const date = z.object({
  type: z.literal("date"),
  date: z
    .object({
      start: z.coerce.date(),
      end: z.coerce.date().nullable(),
    })
    .nullable(),
});
export type date = z.infer<typeof date>;

export const checkbox = z.object({
  type: z.literal("checkbox"),
  checkbox: z.boolean(),
});
export type checkbox = z.infer<typeof checkbox>;

export const people = z.object({
  type: z.literal("people"),
});
export type people = z.infer<typeof people>;

export const relation = z.object({
  type: z.literal("relation"),
  relation: z.object({ id: z.string() }).array(),
});
export type relation = z.infer<typeof relation>;

export const property = z.union([
  text,
  number,
  date,
  title,
  rich_text,
  _status,
  _select,
  _multi_select,
  people,
  relation,
]);
export type property = z.infer<typeof property>;

// block types

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

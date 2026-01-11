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

export const api_color = z.union([color, background_color]);
export type api_color = z.infer<typeof api_color>;

// icons

export const external = z.object({
  type: z.literal("external"),
  external: z.object({
    url: z.string(),
  }),
});

export const emoji = z.object({
  type: z.literal("emoji"),
  emoji: z.string(),
});

export const custom_emoji = z.object({
  type: z.literal("custom_emoji"),
  custom_emoji: z.object({
    name: z.string(),
    url: z.string(),
  }),
});

export const file = z.object({
  type: z.literal("file"),
  file: z.object({
    url: z.string(),
  }),
});

export const icon = z.union([external, emoji, custom_emoji, file]);
export type icon = z.infer<typeof icon>;

// unsupported nodes

export const mention = z.object({ type: z.literal("mention") });
export const equation = z.object({ type: z.literal("equation") });

// property types

export const number = z.object({
  type: z.literal("number"),
  number: z.number().nullable(),
});

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

export const rich_text_item = z.union([text, mention, equation]).array();
export type rich_text_item = z.infer<typeof rich_text_item>;

export const rich_text = z.object({
  type: z.literal("rich_text"),
  rich_text: rich_text_item,
});

export const title = z.object({
  type: z.literal("title"),
  title: rich_text_item,
});

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

export const date = z.object({
  type: z.literal("date"),
  date: z
    .object({
      start: z.coerce.date(),
      end: z.coerce.date().nullable(),
    })
    .nullable(),
});

export const checkbox = z.object({
  type: z.literal("checkbox"),
  checkbox: z.boolean(),
});

// reference types

export const page_id = z.object({
  type: z.literal("page_id"),
  page_id: z.string(),
});

export const block_id = z.object({
  type: z.literal("block_id"),
  block_id: z.string(),
});

// block types

export const paragraph = z.object({
  type: z.literal("paragraph"),
  paragraph: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});

export const heading_1 = z.object({
  type: z.literal("heading_1"),
  heading_1: z.object({
    rich_text: rich_text_item,
    color: api_color,
    is_toggleable: z.boolean(),
  }),
});

export const heading_2 = z.object({
  type: z.literal("heading_2"),
  heading_2: z.object({
    rich_text: rich_text_item,
    color: api_color,
    is_toggleable: z.boolean(),
  }),
});

export const heading_3 = z.object({
  type: z.literal("heading_3"),
  heading_3: z.object({
    rich_text: rich_text_item,
    color: api_color,
    is_toggleable: z.boolean(),
  }),
});

export const bulleted_list_item = z.object({
  type: z.literal("bulleted_list_item"),
  bulleted_list_item: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});

export const numbered_list_item = z.object({
  type: z.literal("numbered_list_item"),
  numbered_list_item: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});

export const quote = z.object({
  type: z.literal("quote"),
  quote: z.object({
    rich_text: rich_text_item,
    color: api_color,
  }),
});

export const divider = z.object({
  type: z.literal("divider"),
});

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
  z.object(base_block_shape).transform((block) => ({
    type: "unsupported_block" as const,
    ...block,
  })),
]);
export type block = z.infer<typeof block>;

import { z } from "zod";
import { zDiscriminatedUnionOption } from "../../../types/zod.js";
import { external, file } from "./media.js";
import { api_color, color } from "./primitives.js";

export const number = z.object({
  type: z.literal("number"),
  number: z.number().nullable(),
});
export type Number = z.infer<typeof number>;

// unsupported
export const formula = z.object({
  type: z.literal("formula"),
});
export type formula = z.infer<typeof formula>;

export const relation = z.object({
  type: z.literal("relation"),
  relation: z.object({ id: z.string() }).array(),
});
export type relation = z.infer<typeof relation>;

export const unique_id = z.object({
  type: z.literal("unique_id"),
  unique_id: z.object({
    prefix: z.string().nullable(),
    number: z.number().nullable(),
  }),
});
export type unique_id = z.infer<typeof unique_id>;

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

// unsupported
export const mention = z.object({ type: z.literal("mention") });

// unsupported
export const equation = z.object({ type: z.literal("equation") });

export const rich_text_item = z.union([text, mention, equation]).array();
export type rich_text_item = z.infer<typeof rich_text_item>;

export const title = z.object({
  type: z.literal("title"),
  title: rich_text_item,
});
export type title = z.infer<typeof title>;

export const rich_text = z.object({
  type: z.literal("rich_text"),
  rich_text: rich_text_item,
});
export type rich_text = z.infer<typeof rich_text>;

export const url = z.object({
  type: z.literal("url"),
  url: z.string().nullable(),
});
export type url = z.infer<typeof url>;

export const people = z.object({
  type: z.literal("people"),
  people: z.object({ id: z.string() }).array(),
});
export type people = z.infer<typeof people>;

export const files = z.object({
  type: z.literal("files"),
  files: z.union([external, file]).array(),
});
export type files = z.infer<typeof files>;

export const email = z.object({
  type: z.literal("email"),
  email: z.string().nullable(),
});
export type email = z.infer<typeof email>;

export const phone_number = z.object({
  type: z.literal("phone_number"),
  phone_number: z.string().nullable(),
});
export type phone_number = z.infer<typeof phone_number>;

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

export const created_by = z.object({
  type: z.literal("created_by"),
  created_by: z.object({ id: z.string() }),
});
export type created_by = z.infer<typeof created_by>;

export const created_time = z.object({
  type: z.literal("created_time"),
  created_time: z.coerce.date(),
});
export type created_time = z.infer<typeof created_time>;

export const last_edited_by = z.object({
  type: z.literal("last_edited_by"),
  last_edited_by: z.object({ id: z.string() }),
});
export type last_edited_by = z.infer<typeof last_edited_by>;

export const last_edited_time = z.object({
  type: z.literal("last_edited_time"),
  last_edited_time: z.coerce.date(),
});
export type last_edited_time = z.infer<typeof last_edited_time>;

// Generics-heavy property types

export function select<T extends string>(options: z.ZodType<T>) {
  return z.object({
    type: z.literal("select"),
    select: z
      .object({
        name: options,
        color: color,
      })
      .nullable(),
  });
}

export type select<T extends string> = z.infer<zSelect<T>>;
export type zSelect<T extends string> = ReturnType<typeof select<T>>;

export function multi_select<T extends string>(options: z.ZodType<T>) {
  return z.object({
    type: z.literal("multi_select"),
    multi_select: z
      .object({
        name: options,
        color: color,
      })
      .array(),
  });
}

export type multi_select<T extends string> = z.infer<zMultiSelect<T>>;
export type zMultiSelect<T extends string> = ReturnType<typeof multi_select<T>>;

export function status<T extends string>(options: z.ZodType<T>) {
  return z.object({
    type: z.literal("status"),
    status: z
      .object({
        name: options,
        color: color,
      })
      .nullable(),
  });
}

export type status<T extends string> = z.infer<zStatus<T>>;
export type zStatus<T extends string> = ReturnType<typeof status<T>>;

// Schema union

export const property = z.union([
  number,
  formula,
  relation,
  unique_id,
  title,
  rich_text,
  url,
  people,
  files,
  email,
  phone_number,
  date,
  checkbox,
  created_by,
  created_time,
  last_edited_by,
  last_edited_time,
  select(z.string()),
  multi_select(z.string()),
  status(z.string()),
]);
export type property = z.infer<typeof property>;

/**
 * Narrows the `property` union to the Zod schema for a specific `type`.
 */
export type zProperty<T extends property["type"] = property["type"]> = Extract<
  (typeof property)["options"][number],
  zDiscriminatedUnionOption<"type", T>
>;

/**
 * A Notion page response `properties` object.
 */
export type Properties = Record<string, property>;

/**
 * Maps a concrete `Properties` shape to its corresponding Zod property schemas.
 */
export type zProperties<Props extends Properties = Properties> = {
  [k in keyof Props]: zProperty<Props[k]["type"]>;
};

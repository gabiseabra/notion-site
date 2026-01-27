import z from "zod";
import { zDiscriminatedUnionOption } from "../../../types/zod.js";
import { color } from "./primitives.js";

const number_format = z.enum([
  "number",
  "number_with_commas",
  "percent",
  "dollar",
  "australian_dollar",
  "canadian_dollar",
  "singapore_dollar",
  "euro",
  "pound",
  "yen",
  "ruble",
  "rupee",
  "won",
  "yuan",
  "real",
  "lira",
  "rupiah",
  "franc",
  "hong_kong_dollar",
  "new_zealand_dollar",
  "krona",
  "norwegian_krone",
  "mexican_peso",
  "rand",
  "new_taiwan_dollar",
  "danish_krone",
  "zloty",
  "baht",
  "forint",
  "koruna",
  "shekel",
  "chilean_peso",
  "philippine_peso",
  "dirham",
  "colombian_peso",
  "riyal",
  "ringgit",
  "leu",
  "argentine_peso",
  "uruguayan_peso",
  "peruvian_sol",
]);

const property_config_base = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

const select_option_config = <T extends string>(name: z.ZodType<T>) =>
  z.object({
    id: z.string(),
    name,
    color: color,
    description: z.string().nullable(),
  });

export const number = property_config_base.extend({
  type: z.literal("number"),
  number: z.object({
    format: number_format,
  }),
});
export type Number = z.infer<typeof number>;

export const formula = property_config_base.extend({
  type: z.literal("formula"),
  formula: z.object({
    expression: z.string(),
  }),
});
export type formula = z.infer<typeof formula>;

export function select<T extends string>(options: z.ZodType<T>) {
  return property_config_base.extend({
    type: z.literal("select"),
    select: z.object({
      options: select_option_config(options).array(),
    }),
  });
}

export type select<T extends string> = z.infer<zSelect<T>>;
export type zSelect<T extends string> = ReturnType<typeof select<T>>;

export function multi_select<T extends string>(options: z.ZodType<T>) {
  return property_config_base.extend({
    type: z.literal("multi_select"),
    multi_select: z.object({
      options: select_option_config(options).array(),
    }),
  });
}

export type multi_select<T extends string> = z.infer<zMultiSelect<T>>;
export type zMultiSelect<T extends string> = ReturnType<typeof multi_select<T>>;

export function status<T extends string>(options: z.ZodType<T>) {
  return property_config_base.extend({
    type: z.literal("status"),
    status: z.object({
      options: select_option_config(options).array(),
      groups: z
        .object({
          id: z.string(),
          name: z.string(),
          color: color,
          option_ids: z.string().array(),
        })
        .array(),
    }),
  });
}

export type status<T extends string> = z.infer<zStatus<T>>;
export type zStatus<T extends string> = ReturnType<typeof status<T>>;

const single_property = z.object({
  type: z.literal("single_property"),
  single_property: z.object({}),
  database_id: z.string(),
});

const dual_property = z.object({
  type: z.literal("dual_property"),
  dual_property: z.object({
    synced_property_id: z.string(),
    synced_property_name: z.string(),
  }),
  database_id: z.string(),
});

export const relation = property_config_base.extend({
  type: z.literal("relation"),
  relation: z.union([single_property, dual_property]),
});
export type relation = z.infer<typeof relation>;

export const unique_id = property_config_base.extend({
  type: z.literal("unique_id"),
  unique_id: z.object({
    prefix: z.string().nullable(),
  }),
});
export type unique_id = z.infer<typeof unique_id>;

export const title = property_config_base.extend({
  type: z.literal("title"),
  title: z.object({}),
});
export type title = z.infer<typeof title>;

export const rich_text = property_config_base.extend({
  type: z.literal("rich_text"),
  rich_text: z.object({}),
});
export type rich_text = z.infer<typeof rich_text>;

export const url = property_config_base.extend({
  type: z.literal("url"),
  url: z.object({}),
});
export type url = z.infer<typeof url>;

export const people = property_config_base.extend({
  type: z.literal("people"),
  people: z.object({}),
});
export type people = z.infer<typeof people>;

export const files = property_config_base.extend({
  type: z.literal("files"),
  files: z.object({}),
});
export type files = z.infer<typeof files>;

export const email = property_config_base.extend({
  type: z.literal("email"),
  email: z.object({}),
});
export type email = z.infer<typeof email>;

export const phone_number = property_config_base.extend({
  type: z.literal("phone_number"),
  phone_number: z.object({}),
});
export type phone_number = z.infer<typeof phone_number>;

export const date = property_config_base.extend({
  type: z.literal("date"),
  date: z.object({}),
});
export type date = z.infer<typeof date>;

export const checkbox = property_config_base.extend({
  type: z.literal("checkbox"),
  checkbox: z.object({}),
});
export type checkbox = z.infer<typeof checkbox>;

export const created_by = property_config_base.extend({
  type: z.literal("created_by"),
  created_by: z.object({}),
});
export type created_by = z.infer<typeof created_by>;

export const created_time = property_config_base.extend({
  type: z.literal("created_time"),
  created_time: z.object({}),
});
export type created_time = z.infer<typeof created_time>;

export const last_edited_by = property_config_base.extend({
  type: z.literal("last_edited_by"),
  last_edited_by: z.object({}),
});
export type last_edited_by = z.infer<typeof last_edited_by>;

export const last_edited_time = property_config_base.extend({
  type: z.literal("last_edited_time"),
  last_edited_time: z.object({}),
});
export type last_edited_time = z.infer<typeof last_edited_time>;

export const property_config = z.discriminatedUnion("type", [
  number,
  formula,
  select(z.string()),
  multi_select(z.string()),
  status(z.string()),
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
]);

export type property_config = z.infer<typeof property_config>;

// property schema union type
export type zPropertyConfig<
  T extends property_config["type"] = property_config["type"],
> = Extract<
  (typeof property_config)["options"][number],
  zDiscriminatedUnionOption<"type", T>
>;

export type PropertyConfigs = Record<string, property_config>;
export type zPropertyConfigs<Props extends PropertyConfigs = PropertyConfigs> =
  {
    [k in keyof Props]: zPropertyConfig<Props[k]["type"]>;
  };

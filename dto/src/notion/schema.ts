import { z } from "zod";

export const external = () =>
  z.object({
    type: z.literal("external"),
    external: z.object({
      url: z.string(),
    }),
  });

export const emoji = () =>
  z.object({
    type: z.literal("emoji"),
    emoji: z.string(),
  });

export const custom_emoji = () =>
  z.object({
    type: z.literal("custom_emoji"),
    custom_emoji: z.object({
      name: z.string(),
      url: z.string(),
    }),
  });

export const file = () =>
  z.object({
    type: z.literal("file"),
    file: z.object({
      url: z.string(),
    }),
  });

export const icon = () =>
  z.union([external(), emoji(), custom_emoji(), file()]);

export const number = () =>
  z.object({
    type: z.literal("number"),
    number: z.number().nullable(),
  });

export const select_color = z.enum([
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
export const select = z.object({
  type: z.literal("url"),
  select: z
    .object({
      name: z.string(),
      color: select_color,
    })
    .nullable(),
});

export const date = z.object({
  type: z.literal("date"),
  date: z.object({
    start: z.coerce.date(),
  }),
});

export const rich_text = z.object({
  type: z.literal("rich_text"),
  rich_text: z.union([text(), emoji()]).array(),
});

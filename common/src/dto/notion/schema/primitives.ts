import { z } from "zod";

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

export const background_color = z.enum([
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

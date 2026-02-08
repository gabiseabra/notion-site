import { z } from "zod";
import { api_color } from "./primitives.js";

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
export const mention = z.object({
  type: z.literal("mention"),
  mention: z.object({}),
});
export type mention = z.infer<typeof mention>;

// unsupported
export const equation = z.object({
  type: z.literal("equation"),
  equation: z.object({}),
});
export type equation = z.infer<typeof equation>;

export const rich_text_item = z.union([text, mention, equation]).array();
export type rich_text_item = z.infer<typeof rich_text_item>;

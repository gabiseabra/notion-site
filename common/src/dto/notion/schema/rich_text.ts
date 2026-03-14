import { z } from "zod";
import { custom_emoji } from "./media.js";
import { api_color, date } from "./primitives.js";
import { database, page, user } from "./references.js";

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

export const link_preview = z.object({
  type: z.literal("link_preview"),
  link_preview: z.object({
    url: z.string(),
  }),
});
export type link_preview = z.infer<typeof link_preview>;

const link_mention = z.object({
  type: z.literal("link_mention"),
  link_mention: z.object({
    href: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    link_author: z.string().optional(),
    link_provider: z.string().optional(),
    thumbnail_url: z.string().optional(),
    icon_url: z.string().optional(),
    iframe_url: z.string().optional(),
    height: z.number().optional(),
    padding: z.number().optional(),
    padding_top: z.number().optional(),
  }),
});
// type link_mention = z.infer<typeof link_mention>;

const template_mention_date = z.object({
  type: z.literal("template_mention_date"),
  template_mention_date: z.enum(["today", "now"]),
});
// type template_mention_date = z.infer<typeof template_mention_date>;

const template_mention_user = z.object({
  type: z.literal("template_mention_user"),
  template_mention_user: z.literal("me"),
});
// type template_mention_user = z.infer<typeof template_mention_user>;

const template_mention = z.object({
  type: z.literal("template_mention"),
  template_mention: z.discriminatedUnion("type", [
    template_mention_date,
    template_mention_user,
  ]),
});
// type template_mention = z.infer<typeof template_mention>;

export const mention = z.object({
  type: z.literal("mention"),
  mention: z.discriminatedUnion("type", [
    date,
    link_preview,
    link_mention,
    template_mention,
    user,
    page,
    database,
    custom_emoji,
  ]),
  annotations,
});
export type mention = z.infer<typeof mention>;

export const equation = z.object({
  type: z.literal("equation"),
  equation: z.object({
    expression: z.string(),
  }),
  annotations,
});
export type equation = z.infer<typeof equation>;

export const rich_text_item = z
  .discriminatedUnion("type", [text, mention, equation])
  .array();
export type rich_text_item = z.infer<typeof rich_text_item>;

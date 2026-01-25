import { z } from "zod";

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

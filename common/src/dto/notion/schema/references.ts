import { z } from "zod";

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

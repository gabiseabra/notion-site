import { z } from "zod";
import * as zN from "./schema.js";

/**
 * Creates a Zod schema for a Notion database entry.
 * A Notion database is isomorphic to a Notion page with extra properties.
 * This helper captures that shared page shape and lets you provide the additional properties shape specific to a given
 * database.
 * Use this to define schemas that parse and validate responses returned by the Notion SDK.
 */
export const NotionDatabase = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    id: z.string(),
    url: z.string().transform((url) => URL.parse(url)?.pathname ?? url),
    parent: z.union([zN.database_id, zN.page_id, zN.workspace]),
    icon: zN.icon.nullable(),
    cover: zN.cover.nullable(),
    properties: z.object(shape),
  });
export type NotionDatabase<
  T extends Record<string, zN.property> = Record<string, zN.property>,
> = {
  properties: T;
} & Omit<
  z.infer<ReturnType<typeof NotionDatabase<z.ZodRawShape>>>,
  "properties"
>;

/**
 * A generic notion database.
 */
export const _NotionDatabase = z.object({
  id: z.string(),
  url: z.string().transform((url) => URL.parse(url)?.pathname ?? url),
  parent: z.union([zN.database_id, zN.page_id, zN.workspace]),
  icon: zN.icon.nullable(),
  cover: zN.cover.nullable(),
  properties: z.record(zN.property),
});

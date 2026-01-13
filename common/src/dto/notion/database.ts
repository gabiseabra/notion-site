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
    icon: zN.icon.nullable(),
    cover: zN.cover.nullable(),
    properties: z.object({
      Title: zN.title,
      ...shape,
    }),
  });
export type NotionDatabase<
  T extends NotionPropertiesRecord = NotionPropertiesRecord,
> = {
  properties: { Title: zN.title } & T;
} & Omit<
  z.infer<ReturnType<typeof NotionDatabase<z.ZodRawShape>>>,
  "properties"
>;

/**
 * Matches all valid Notion database property schemas.
 */
export const NotionProperty = z.union([
  zN.text,
  zN.number,
  zN.date,
  zN.title,
  zN.rich_text,
  zN._status,
  zN._select,
  zN._multi_select,
]);
export type NotionProperty = z.infer<typeof NotionProperty>;
export type NotionPropertiesRecord = { [k: string]: NotionProperty };

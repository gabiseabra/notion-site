import { z } from "zod";
import * as n from "./schema.js";

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
    icon: n.icon.nullable(),
    cover: n.cover.nullable(),
    properties: z.object({
      Title: n.title,
      ...shape,
    }),
  });
/**
 * Matches all valid Notion database property schemas.
 */
export const NotionProperty = z.union([
  n.text,
  n.number,
  n.date,
  n.title,
  n.rich_text,
  n._status,
  n._select,
  n._multi_select,
]);
export type NotionProperty = z.infer<typeof NotionProperty>;
export type NotionPropertiesRecord = { [k: string]: NotionProperty };
export type NotionDatabase<
  T extends NotionPropertiesRecord = NotionPropertiesRecord,
> = {
  properties: { Title: n.title } & T;
} & Omit<
  z.infer<ReturnType<typeof NotionDatabase<z.ZodRawShape>>>,
  "properties"
>;

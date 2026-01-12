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
    url: z.string(),
    icon: n.icon.nullable(),
    cover: n.cover.nullable(),
    properties: z.object({
      Title: n.title,
      ...shape,
    }),
  });
export type NotionDatabase<T extends z.ZodRawShape> = z.infer<
  ReturnType<typeof NotionDatabase<T>>
>;

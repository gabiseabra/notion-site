import { z } from "zod";
import { zNotion } from "./schema/index.js";

/**
 * Creates a Zod schema for a Notion database entry.
 * A Notion database is isomorphic to a Notion page with extra properties.
 * This helper captures that shared page shape and lets you provide the additional properties shape specific to a given
 * database.
 * Use this to define schemas that parse and validate responses returned by the Notion SDK.
 */
export const NotionResource = <Props extends zNotion.properties.zProperties>(
  shape: Props,
) =>
  _NotionResource.omit({ properties: true }).extend({
    properties: z.object(shape),
  });

export type NotionResource<
  T extends zNotion.properties.Properties = zNotion.properties.Properties,
> = {
  properties: T;
} & Omit<z.infer<typeof _NotionResource>, "properties">;

/**
 * A generic notion database resource or page with all properties.
 */
export const _NotionResource = z.object({
  id: z.string(),
  url: z.string().transform((url) => URL.parse(url)?.pathname ?? url),
  parent: z.union([
    zNotion.references.database_id,
    zNotion.references.page_id,
    zNotion.references.workspace,
  ]),
  icon: zNotion.media.icon.nullable(),
  cover: zNotion.media.cover.nullable(),
  properties: z.record(zNotion.properties.property),
});

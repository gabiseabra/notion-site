import { match } from "ts-pattern";
import { z } from "zod";
import { zNotion } from "./schema/index.js";

/**
 * A generic Notion database response schema with all properties untyped.
 */
export const _NotionDatabase = z.object({
  object: z.literal("database"),

  id: z.string(),
  url: z.string().transform((url) => URL.parse(url)?.pathname ?? url),
  parent: z.union([
    zNotion.references.database_id,
    zNotion.references.page_id,
    // probably related to this if inline
    zNotion.references.block_id,
    zNotion.references.workspace,
  ]),

  title: zNotion.properties.rich_text_item,
  description: zNotion.properties.rich_text_item,
  icon: zNotion.media.icon.nullable(),
  cover: zNotion.media.cover.nullable(),

  properties: z.record(zNotion.database.property_config),
});

/**
 * Creates a Notion database schema with strong types based on the properties shape.
 */
const zNotionDatabase = <
  PropertyConfigs extends zNotion.database.zPropertyConfigs,
>(
  shape: PropertyConfigs,
) =>
  _NotionDatabase.omit({ properties: true }).extend({
    properties: z.object(shape),
  });

/**
 * The type of a concrete notion database with generic properties object.
 */
export type NotionDatabase<
  T extends zNotion.database.PropertyConfigs = zNotion.database.PropertyConfigs,
> = {
  properties: T;
} & Omit<z.infer<typeof _NotionDatabase>, "properties">;

export const NotionDatabase = Object.assign(zNotionDatabase, {
  /**
   * Infers a database object schema from a page object schema.
   */
  fromResource<Properties extends zNotion.properties.zProperties>(schema: {
    shape: { properties: { shape: Properties } };
  }) {
    // this is actually really simple, I promise . . .
    return zNotionDatabase(
      Object.fromEntries(
        // just map each property key/value pair of the resource schema,
        Object.entries(schema.shape.properties.shape).map(([key, prop]) => [
          key,
          // replacing the schema of each property with a matching property_config schema.
          match(prop.shape)
            // in the case of properties with generic types, u also need to map the thing.
            .with({ type: { value: "status" } }, (status) =>
              zNotion.database.status(status.status.unwrap().shape.name),
            )
            .with({ type: { value: "select" } }, (select) =>
              zNotion.database.select(select.select.unwrap().shape.name),
            )
            .with({ type: { value: "multi_select" } }, (multi_select) =>
              zNotion.database.multi_select(
                multi_select.multi_select.element.shape.name,
              ),
            )
            // otherwise just map to an option with the same discriminant and you should be fine.
            .otherwise((prop) =>
              zNotion.database.property_config.options.find(
                (option) => option.shape.type.value === prop.type.value,
              ),
            ),
        ]),
      ) as {
        // this type does the same as the match above: mapping property types to their respective database types while
        // also handling special cases for generics.
        [k in keyof Properties]: Properties[k] extends zNotion.properties.zStatus<
          infer Options
        >
          ? zNotion.database.zStatus<Options>
          : Properties[k] extends zNotion.properties.zSelect<infer Options>
            ? zNotion.database.zSelect<Options>
            : Properties[k] extends zNotion.properties.zMultiSelect<
                  infer Options
                >
              ? zNotion.database.zMultiSelect<Options>
              : zNotion.database.zPropertyConfig<
                  Properties[k]["shape"]["type"]["value"]
                >;
      },
    );
  },
});

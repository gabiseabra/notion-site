import {
  NotionDatabase,
  NotionProperty,
} from "@notion-site/common/dto/notion/database.js";
import { APIResponseError, Client as NotionClient } from "@notionhq/client";
import z from "zod";
import {
  type ListBlockChildrenResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints.js";
import { DistributiveOmit } from "@notion-site/common/utils/types.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import * as n from "@notion-site/common/dto/notion/schema.js";

const notionToken = process.env.NOTION_TOKEN;
const notion = new NotionClient({ auth: notionToken });

/**
 * Minimal boolean-expression wrapper used to build Notion `filter` objects.
 * Notion supports nesting filters with `{ and: [...] }` / `{ or: [...] }`.
 * This type allows either a single filter node (`T`) or a nested conjunction/disjunction.
 */
type Expr<T> = { and: T[] } | { or: T[] } | T;

/**
 * Filter variants that target Notion page timestamps.
 */
type NotionTimestampFilter = Extract<
  QueryDatabaseParameters["filter"],
  { type?: "created_time" | "last_edited_time" }
>;

/**
 * Property filter variants compatible with a specific Notion property type.
 * Inferred from the Notion SDK’s `QueryDatabaseParameters["filter"]` union.
 */
type NotionPropertyFilter<Prop extends NotionProperty> = Extract<
  QueryDatabaseParameters["filter"],
  { type?: Prop["type"] }
>;

/**
 * Filter union for a concrete database schema.
 * Produces a union of all valid property filters for the database’s declared properties.
 */
type NotionDatabaseFilter<DB extends NotionDatabase> =
  | {
      [k in keyof DB["properties"] & string]: DistributiveOmit<
        NotionPropertyFilter<DB["properties"][k]>,
        "property"
      > & { property: k };
    }[keyof DB["properties"] & string]
  | NotionTimestampFilter;

/**
 * Sort descriptor restricted to property names declared in the database schema or timestamps.
 */
type NotionDatabaseSorting<DB extends NotionDatabase> =
  | {
      property: Extract<keyof DB["properties"], string>;
      direction: "ascending" | "descending";
    }
  | {
      timestamp: "created_time" | "last_edited_time";
      direction: "ascending" | "descending";
    };

export async function queryNotionDatabase<DB extends NotionDatabase>(
  databaseId: string,
  schema: z.ZodSchema<DB>,
  {
    limit,
    after,
    filter,
    sorts,
  }: {
    limit: number;
    after?: string;
    filter?: Expr<NotionDatabaseFilter<DB>>;
    sorts?: NotionDatabaseSorting<DB>[];
  },
) {
  const response = await notion.databases.query({
    database_id: databaseId,
    start_cursor: after,
    page_size: limit,
    filter,
    sorts,
  });

  const results = response.results.map((node) => ({
    id: node.id,
    ...schema.safeParse(node),
  }));

  return {
    results: results
      .filter(hasPropertyValue("success", true))
      .map((result) => result.data),
    errors: results
      .filter(hasPropertyValue("success", false))
      .map((result) => ({
        id: result.id,
        error: result.error,
      })),
    pageInfo: {
      hasNextPage: response.has_more,
      nextCursor: response.next_cursor,
    },
  };
}

export async function getNotionPage<DB extends NotionDatabase>(
  id: string,
  schema: z.ZodSchema<DB>,
) {
  const response = await notion.pages
    .retrieve({
      page_id: id,
    })
    .catch((error) => {
      if (error instanceof APIResponseError && error.status === 404) {
        return null;
      } else {
        throw error;
      }
    });

  if (!response) return null;

  const parseResult = schema.safeParse(response);

  if (!parseResult.success) {
    throw new Error(`Failed to parse database entry ${id}`);
  }

  return parseResult.data;
}

export async function getNotionBlocks(id: string) {
  const blocks: n.block[] = [];
  const errors: { id: string; error: z.ZodError }[] = [];

  let cursor = undefined;

  do {
    const response: ListBlockChildrenResponse | null =
      await notion.blocks.children
        .list({
          block_id: id,
          page_size: 100,
          start_cursor: cursor,
        })
        .catch(() => {
          return null;
        });

    if (!response) return { blocks, errors };

    for (const block of response.results) {
      const parseResult = n.block.safeParse(block);

      if (!parseResult.success) {
        errors.push({ id: block.id, error: parseResult.error });
      } else {
        const block = parseResult.data;

        blocks.push(block);

        if (block.has_children) {
          const children = await getNotionBlocks(block.id);

          blocks.push(...children.blocks);
          errors.push(...children.errors);
        }
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return { blocks, errors };
}

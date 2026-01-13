import { NotionDatabase } from "@notion-site/common/dto/notion/database.js";
import { APIResponseError, Client as NotionClient } from "@notionhq/client";
import z from "zod";
import {
  type ListBlockChildrenResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints.js";
import { DistributiveOmit } from "@notion-site/common/utils/types.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import * as zN from "@notion-site/common/dto/notion/schema.js";
import { showError } from "@notion-site/common/utils/error.js";

const notionToken = process.env.NOTION_TOKEN;
const notion = new NotionClient({ auth: notionToken });

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
type NotionPropertyFilter<Prop extends zN.property> = Extract<
  QueryDatabaseParameters["filter"],
  { type?: Prop["type"] }
>;

/**
 * PropertyFilter union of a concrete database schema.
 */
type NotionDatabaseFilter<DB extends NotionDatabase> = {
  [k in keyof DB["properties"] & string]: DistributiveOmit<
    NotionPropertyFilter<DB["properties"][k]>,
    "property"
  > & { property: k };
}[keyof DB["properties"] & string];

/**
 * Notion SDK database.query filters expression for a concrete database schema.
 */
type NotionDatabaseFilterExpr<DB extends NotionDatabase> = Expr<
  | NotionDatabaseFilter<DB>
  | NotionTimestampFilter
  | Expr<NotionDatabaseFilter<DB>>
>;

type Expr<T> = { and: T[] } | { or: T[] } | T;

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

/**
 * Queries a Notion database with filter types inferred from the provided zod schema, and parses results.
 */
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
    filter?: NotionDatabaseFilterExpr<DB>;
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

/**
 * Get an arbitrary notion page by id and parse it with the given schema.
 */
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
    throw new Error(
      `Failed to parse page ${id}: ${showError({
        error: parseResult.error,
        response,
      })}`,
    );
  }

  return parseResult.data;
}

/**
 * Recursively fetches all blocks for a page (depth-first) and parses them.
 */
export async function getNotionBlocks(id: string) {
  const blocks: zN.block[] = [];
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
      const parseResult = zN.block.safeParse(block);

      if (!parseResult.success) {
        errors.push({ id: block.id, error: parseResult.error });
      } else {
        const block = parseResult.data;

        blocks.push(block);

        if (block.has_children && block.type !== "child_page") {
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

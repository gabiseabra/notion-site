import { APIResponseError, Client as NotionClient } from "@notionhq/client";
import {
  BlockObjectResponse,
  GetBlockResponse,
  GetDatabaseResponse,
  GetPageResponse,
  type ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.js";
import { GetBlogPostsInput } from "@notion-site/common/dto/orpc/blog-posts.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import * as n from "@notion-site/common/dto/notion/schema.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import memoize from "memoizee";

const ttl = process.env.NODE_ENV === "development" ? 10 : 60_000 * 5;

const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID ?? "xyz";

const notion = new NotionClient({ auth: notionToken });

async function _getBlogPosts(filters: GetBlogPostsInput) {
  const response = await notion.databases.query({
    database_id: databaseId,
    start_cursor: filters.after,
    page_size: filters.limit,
    filter: {
      and: [
        // Default filters
        {
          type: "status" as const,
          property: "Status",
          status: { equals: "Published" },
        },
        // Apply filters from request
        filters.query && {
          type: "title" as const,
          property: "Title",
          title: { contains: filters.query },
        },
        ...(filters.tags ?? []).map((tag) => ({
          type: "multi_select" as const,
          property: "Tags",
          multi_select: { contains: tag },
        })),
      ].filter(isTruthy),
    },
    sorts: [
      {
        property: "Publish Date",
        direction: "descending",
      },
    ],
  });

  const posts = response.results
    // u shouldn't return PartialPageObjectResponse here???
    .filter(isPageObjectResponse)
    .map(parseBlogPost);

  return {
    posts,
    pageInfo: {
      hasNextPage: response.has_more,
      nextCursor: response.next_cursor,
    },
  };
}

export const getBlogPosts = memoize(_getBlogPosts, {
  async: true,
  maxAge: ttl,
});

async function _getBlogPost(id: string) {
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

  if (!response || !isPageObjectResponse(response)) return null;

  return parseBlogPost(response);
}

export const getBlogPost = memoize(_getBlogPost, { async: true, maxAge: ttl });

async function _getBlocks(id: string) {
  const blocks: n.block[] = [];
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

    if (!response) return [];

    for (const block of response.results
      .filter(isBlockObjectResponse)
      .map(parseBlock)) {
      blocks.push(block);

      if (block.has_children) {
        blocks.push(...(await getBlocks(block.id)));
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

export const getBlocks = memoize(_getBlocks, { async: true, maxAge: ttl });

function isPageObjectResponse(
  page: GetPageResponse | GetDatabaseResponse,
): page is PageObjectResponse {
  return true;
}

function parseBlogPost(page: PageObjectResponse): BlogPost {
  const result = BlogPost.safeParse(page);

  if (!result.success) {
    throw new Error(
      `Failed to parse blog post ${page.url} : ${JSON.stringify(result.error, null, 2)}`,
    );
  }

  return {
    ...result.data,
    url: new URL(result.data.url).pathname.replace(/^\//, ""),
  };
}

function isBlockObjectResponse(
  block: GetBlockResponse,
): block is BlockObjectResponse {
  return true;
}

function parseBlock(block: BlockObjectResponse): n.block {
  const result = n.block.safeParse(block);

  if (!result.success) {
    throw new Error(`Failed to parse block`);
  }

  return result.data;
}

import { Client as NotionClient } from "@notionhq/client";
import {
  BlockObjectResponse,
  GetBlockResponse,
  GetDatabaseResponse,
  GetPageResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.js";
import { GetBlogPostsInput } from "@notion-site/common/dto/orpc/blog-posts.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";

const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";
const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID ?? "xyz";

const notion = new NotionClient({ auth: notionToken });

export async function getBlogPosts(filters: GetBlogPostsInput) {
  const response = await notion.databases.query({
    database_id: databaseId,
    start_cursor: filters.after,
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

export async function getBlogPost(id: string) {
  const response = await notion.pages.retrieve({
    page_id: id,
  });

  if (!isPageObjectResponse(response)) {
    throw new Error("lmao");
  }

  return parseBlogPost(response);
}

export async function getBlocks(id: string) {
  const blocks: BlockObjectResponse[] = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: id,
      page_size: 100,
      start_cursor: cursor,
    });

    for (const block of response.results.filter(isBlockObjectResponse)) {
      // add this block
      blocks.push(block);
      // if block has nested children, fetch them too
      if (block.has_children) {
        const nested = await getBlocks(block.id);
        blocks.push(...nested);
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

function parseBlogPost(page: PageObjectResponse): BlogPost {
  const result = BlogPost.safeParse(page);

  if (!result.success) {
    throw new Error(`Failed to parse blog post ${page.url}`);
  }

  return {
    ...result.data,
    url: new URL(result.data.url).pathname.replace(/^\//, ""),
  };
}

function isPageObjectResponse(
  page: GetPageResponse | GetDatabaseResponse,
): page is PageObjectResponse {
  return true;
}

function isBlockObjectResponse(
  page: GetBlockResponse,
): page is BlockObjectResponse {
  return true;
}

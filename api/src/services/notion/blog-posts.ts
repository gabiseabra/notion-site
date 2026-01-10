import { Client as NotionClient } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { GetBlogPostsInput } from "@notion-site/dto/orpc/blog-posts.js";
import { BlogPost } from "@notion-site/dto/notion/blog-post.js";

const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";
const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID ?? "xyz";

const notion = new NotionClient({ auth: notionToken });

export async function getBlogPosts({}: GetBlogPostsInput) {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Publish Date",
        direction: "descending",
      },
    ],
  });

  const posts = response.results
    // notion types sucks ass: u shouldn't return PartialPageObjectResponse here???
    .filter((page): page is PageObjectResponse => true)
    .map(parseBlogPost);

  return {
    posts,
    pageInfo: {
      hasNextPage: response.has_more,
      nextCursor: response.next_cursor,
    },
  };
}

function parseBlogPost(page: PageObjectResponse): BlogPost {
  const result = BlogPost.safeParse(page);

  if (!result.success) {
    throw new Error(`Failed to parse blog post ${page.url}`);
  }

  return result.data;
}

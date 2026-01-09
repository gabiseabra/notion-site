import { Client as NotionClient } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { z } from "zod";
import { Post } from "@notion-site/dto/posts/index.js";
import { GetPostsInput } from "@notion-site/dto/orpc/posts.js";
import * as n from "@notion-site/dto/notion/schema.js";

const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";
const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID ?? "xyz";

const notion = new NotionClient({ auth: notionToken });

const BlogPage = z.object({
  url: z.string(),
  icon: n.icon().nullable(),
  properties: z.object({
    "Publish Date": n.date(),
    Title: n.text(),
  }),
});

export async function getPosts({}: GetPostsInput) {
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
    .map(mapPost);

  return {
    posts,
    pageInfo: {
      hasNextPage: response.has_more,
      nextCursor: response.next_cursor,
    },
  };
}

function mapPost(page: PageObjectResponse): Post {
  const result = BlogPage.safeParse(page);

  console.log(JSON.stringify(page, null, 2));
  // console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(`Failed to parse post`);
  }

  return {
    icon: "",
  };
}

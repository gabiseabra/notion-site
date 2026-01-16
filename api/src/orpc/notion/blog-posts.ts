import { implement } from "@orpc/server";
import { api } from "@notion-site/common/orpc/index.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import {
  getDatabaseSelectOptions,
  getNotionBlocks,
  getNotionPage,
  queryNotionDatabase,
} from "../../services/notion/api.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";

const c = implement(api.notion.blogPosts);

const databaseId = process.env.NOTION_DATABASE_ID ?? "";

export const blogPosts = c.router({
  queryBlogPosts: c.queryBlogPosts.handler(async ({ input }) => {
    const { results, pageInfo } = await queryNotionDatabase(
      databaseId,
      BlogPost,
      {
        limit: input.limit,
        after: input.after,
        sorts: [
          {
            property: "Publish Date",
            direction: "descending",
          },
          {
            timestamp: "created_time",
            direction: "descending",
          },
        ],
        filter: {
          and: [
            // Show unpublished posts in dev mode
            process.env.NODE_ENV === "development"
              ? undefined
              : ({
                  property: "Status",
                  status: { equals: "Published" },
                } as const),

            // Apply filters from request
            // query
            input.query &&
              ({
                property: "Title",
                title: { contains: input.query },
              } as const),

            // tags
            ...(input.tags ?? []).map(
              (tag) =>
                ({
                  property: "Tags",
                  multi_select: { contains: tag },
                }) as const,
            ),
          ].filter(isTruthy),
        },
      },
    );

    return {
      posts: results,
      pageInfo,
    };
  }),

  getBlogPost: c.getBlogPost.handler(async ({ input, errors }) => {
    const [post, { blocks }] = await Promise.all([
      getNotionPage(input.id, BlogPost),
      getNotionBlocks(input.id),
    ]);

    if (!post) {
      throw errors.NOT_FOUND();
    }

    return { ...post, blocks };
  }),

  getAllTags: c.getAllTags.handler(async () => {
    return getDatabaseSelectOptions(
      databaseId,
      "Tags" satisfies keyof BlogPost["properties"],
    );
  }),
});

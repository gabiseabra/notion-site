import { implement } from "@orpc/server";
import { api } from "@notion-site/common/orpc/index.js";
import { BlogPost } from "@notion-site/common/dto/notion/blog-post.js";
import {
  getDatabaseSelectOptions,
  getNotionPage,
  queryNotionDatabase,
} from "../../services/notion/api.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import * as env from "../../utils/env.js";
import { getResourceUrl } from "../../utils/router.js";

const c = implement(api.notion.blogPosts);

export const blogPosts = c.router({
  queryBlogPosts: c.queryBlogPosts.handler(async ({ input, errors }) => {
    if (!env.BLOG_POSTS_DATABASE_ID) {
      throw errors.NO_DATABASE();
    }

    const { results, pageInfo } = await queryNotionDatabase(
      env.BLOG_POSTS_DATABASE_ID,
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
      posts: results.map(mapBlogPost),
      pageInfo,
    };
  }),

  getBlogPost: c.getBlogPost.handler(async ({ input, errors }) => {
    if (!env.BLOG_POSTS_DATABASE_ID) {
      throw errors.NO_DATABASE();
    }

    const blogPost = await getNotionPage(input.id, BlogPost);

    if (!blogPost) {
      throw errors.NOT_FOUND();
    }

    return mapBlogPost(blogPost);
  }),

  getAllTags: c.getAllTags.handler(async ({ errors }) => {
    if (!env.BLOG_POSTS_DATABASE_ID) {
      throw errors.NO_DATABASE();
    }

    return getDatabaseSelectOptions(
      env.BLOG_POSTS_DATABASE_ID,
      "Tags" satisfies keyof BlogPost["properties"],
    );
  }),
});

function mapBlogPost(blogPost: BlogPost) {
  return {
    ...blogPost,
    url: getResourceUrl(blogPost) ?? blogPost.url,
  };
}

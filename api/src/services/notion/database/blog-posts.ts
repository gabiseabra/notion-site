import { BlogPost } from "@notion-site/common/dto/blog-posts/index.js";
import { BlogPostsInput } from "@notion-site/common/dto/blog-posts/input.js";
import { BlogPostStatus } from "@notion-site/common/dto/blog-posts/status.js";
import { NotionDatabase } from "@notion-site/common/dto/notion/database.js";
import { isTruthy } from "@notion-site/common/utils/guards.js";
import { Item } from "feed";
import * as env from "../../../env.js";
import { QueryNotionDatabaseOptions } from "../api.js";

export const BlogPostsDB = Object.assign(
  NotionDatabase.fromResource(BlogPost),
  {
    inputOptions: (
      input: BlogPostsInput,
    ): QueryNotionDatabaseOptions<BlogPost> => ({
      cache:
        !input.query &&
        !input.after &&
        !input.tags?.length &&
        !input.statuses?.length,
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
          // Only show completed statuses in production
          env.DEV
            ? undefined
            : {
                or: BlogPostStatus.options
                  .filter(BlogPostStatus.isCompleted)
                  .map((status) => ({
                    property: "Status" as const,
                    status: { equals: status },
                  })),
              },

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

          // statuses
          {
            or: (input.statuses ?? []).map(
              (status) =>
                ({
                  property: "Status",
                  status: { equals: status },
                }) as const,
            ),
          },

          // authors
          {
            or: (input.authors ?? []).map(
              (author) =>
                ({
                  property: "Author",
                  select: { equals: author },
                }) as const,
            ),
          },
        ].filter(isTruthy),
      },
    }),
    feedOptions: (input: BlogPostsInput) => ({
      ...BlogPostsDB.inputOptions(input),
      cache: true,
      feedItem: (post: BlogPost): Partial<Item> => ({
        published: post.properties["Publish Date"]?.date?.start ?? undefined,
      }),
    }),
  },
);

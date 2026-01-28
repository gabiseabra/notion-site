import { BlogPost } from "@notion-site/common/dto/blog-posts/index.js";
import { BlogPostStatus } from "@notion-site/common/dto/blog-posts/status.js";
import { NotionDatabase } from "@notion-site/common/dto/notion/database.js";
import { _NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { NotionPage } from "@notion-site/common/dto/pages/index.js";
import { api } from "@notion-site/common/orpc/index.js";
import {
  hasPropertyValue,
  isTruthy,
} from "@notion-site/common/utils/guards.js";
import { replaceBlockUrls } from "@notion-site/common/utils/notion.js";
import { isUuid } from "@notion-site/common/utils/uuid.js";
import { implement } from "@orpc/server";
import * as env from "../../../env.js";
import { extractUuid, getRouteByResource } from "../../../utils/route.js";
import { getNotionBlocks, getNotionPage } from "../../notion/api.js";
import {
  describeNotionDatabaseHandler,
  getNotionResourceHandler,
  queryNotionDatabaseHandler,
  routeHandler,
} from "../../notion/orpc.js";

const c = implement(api.notion);

export const notion = c.router({
  getBlocks: c.getBlocks.handler(
    routeHandler(async ({ route, errors }) => {
      const result = await getNotionBlocks(route.id);

      if (!result) {
        throw errors.NOT_FOUND({ data: { id: route.id } });
      }

      return {
        blocks: await Promise.all(
          // replace links in blocks with the canonical urls of pages
          result.blocks.map((block) =>
            replaceBlockUrls(block, async (url) => {
              const id = extractUuid(url.replace(/^\//, ""));

              if (id && isUuid(id)) {
                const resource = await getNotionPage(id, _NotionResource);
                if (resource) {
                  return getRouteByResource(resource)?.path ?? url;
                }
              }

              return url;
            }),
          ),
        ),
      };
    }),
  ),

  getMetadata: c.getMetadata.handler(
    routeHandler(async ({ route, errors }) => {
      const resource = await getNotionPage(route.id, _NotionResource);

      if (!resource) {
        throw errors.NOT_FOUND({ data: { id: route.id } });
      }

      route = getRouteByResource(resource) ?? route;

      return {
        id: resource.id,
        cover: resource.cover,
        icon: resource.icon,
        parent: resource.parent,
        url: route.path,
        title:
          Object.values(resource.properties).find(
            hasPropertyValue("type", "title"),
          ) ?? null,
        route,
      };
    }),
  ),

  getPage: c.getPage.handler(getNotionResourceHandler(NotionPage)),

  getBlogPost: c.getBlogPost.handler(getNotionResourceHandler(BlogPost)),

  describeBlogPosts: c.describeBlogPosts.handler(
    describeNotionDatabaseHandler(
      env.BLOG_POSTS_DATABASE_ID,
      NotionDatabase.fromResource(BlogPost),
    ),
  ),

  queryBlogPosts: c.queryBlogPosts.handler(
    queryNotionDatabaseHandler(
      env.BLOG_POSTS_DATABASE_ID,
      BlogPost,
      (input) => ({
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
          ].filter(isTruthy),
        },
      }),
    ),
  ),
});

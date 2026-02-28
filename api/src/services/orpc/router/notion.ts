import { BlogPost } from "@notion-site/common/dto/blog-posts/index.js";
import { _NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { NotionPage } from "@notion-site/common/dto/pages/index.js";
import { api } from "@notion-site/common/orpc/index.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { isUuid } from "@notion-site/common/utils/uuid.js";
import { implement } from "@orpc/server";
import * as env from "../../../env.js";
import { extractUuid, getRouteByResource } from "../../../utils/route.js";
import { getNotionBlocks, getNotionPage } from "../../notion/api.js";
import { BlogPostsDB } from "../../notion/database/blog-posts.js";
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
          result.blocks.map(async (block) => {
            if (!Notion.Block.isRichText(block)) {
              return block;
            } else {
              return Notion.Block.traverse(block, async (node) => ({
                ...node,
                rich_text: await Notion.RTF.traverseText(
                  node.rich_text,
                  mapTextItem,
                ),
              }));
            }
          }),
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
    describeNotionDatabaseHandler(env.BLOG_POSTS_DATABASE_ID, BlogPostsDB),
  ),

  queryBlogPosts: c.queryBlogPosts.handler(
    queryNotionDatabaseHandler(
      env.BLOG_POSTS_DATABASE_ID,
      BlogPost,
      BlogPostsDB.inputOptions,
    ),
  ),
});

async function replaceUrl(url: string) {
  const id = extractUuid(url.replace(/^\//, ""));

  if (id && isUuid(id)) {
    const resource = await getNotionPage(id, _NotionResource);
    if (resource) {
      return getRouteByResource(resource)?.path ?? url;
    }
  }

  if (env.SITE_URL && url.startsWith(env.SITE_URL)) {
    return url.slice(env.SITE_URL.length);
  } else {
    return url;
  }
}

async function mapTextItem(item: Notion.RTF.Item<"text">) {
  return {
    ...item,
    text: {
      link: item.text.link
        ? { url: await replaceUrl(item.text.link.url) }
        : null,
      content:
        Notion.RTF.isItemRedacted(item) && !env.DEV
          ? "█".repeat(item.text.content.length)
          : item.text.content,
    },
  };
}

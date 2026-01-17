import { implement } from "@orpc/server";
import { api } from "@notion-site/common/orpc/index.js";
import { NotionPage } from "@notion-site/common/dto/notion/page.js";
import { getNotionBlocks, getNotionPage } from "../../services/notion/api.js";
import { _NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { getResourceUrl, matchRoute } from "../../utils/route.js";

const c = implement(api.notion.pages);

export const pages = c.router({
  getPage: c.getPage.handler(async ({ input, errors }) => {
    const route = matchRoute(input.id);

    if (!route) {
      throw errors.NOT_FOUND();
    }

    const page = await getNotionPage(route.id, NotionPage);

    if (!page) {
      throw errors.NOT_FOUND();
    }

    return {
      ...page,
      route,
      url: getResourceUrl(page) ?? page.url,
    };
  }),

  getMetadata: c.getMetadata.handler(async ({ input, errors }) => {
    const route = matchRoute(input.id);

    if (!route) {
      throw errors.NOT_FOUND();
    }

    const resource = await getNotionPage(route.id, _NotionResource);

    if (!resource) {
      throw errors.NOT_FOUND();
    }

    return {
      ...resource,
      route,
      url: getResourceUrl(resource) ?? resource.url,
    };
  }),

  getBlocks: c.getBlocks.handler(async ({ input }) => {
    const { blocks } = await getNotionBlocks(
      matchRoute(input.id)?.id ?? input.id,
    );

    return { blocks };
  }),
});

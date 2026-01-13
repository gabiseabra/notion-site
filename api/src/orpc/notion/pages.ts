import { implement } from "@orpc/server";
import { api } from "@notion-site/common/orpc/index.js";
import { NotionPage } from "@notion-site/common/dto/notion/page.js";
import { getNotionBlocks, getNotionPage } from "../../services/notion/api.js";
import { _NotionResource } from "@notion-site/common/dto/notion/resource.js";

const c = implement(api.notion.pages);

export const pages = c.router({
  getPage: c.getPage.handler(async ({ input, errors }) => {
    const page = await getNotionPage(input.id, NotionPage);

    if (!page) {
      throw errors.NOT_FOUND();
    }

    return page;
  }),

  getMetadata: c.getMetadata.handler(async ({ input, errors }) => {
    const resource = await getNotionPage(input.id, _NotionResource);

    if (!resource) {
      throw errors.NOT_FOUND();
    }

    return resource;
  }),

  getBlocks: c.getBlocks.handler(async ({ input }) => {
    const { blocks } = await getNotionBlocks(input.id);

    return { blocks };
  }),
});

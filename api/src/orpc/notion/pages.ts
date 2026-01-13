import { implement } from "@orpc/server";
import { api } from "@notion-site/common/orpc/index.js";
import { NotionPage } from "@notion-site/common/dto/notion/page.js";
import { getNotionBlocks, getNotionPage } from "../../services/notion/api.js";

const c = implement(api.notion.pages);

export const pages = c.router({
  getPageById: c.getPageById.handler(async ({ input, errors }) => {
    console.log("!!!", input.id);

    const [page, { blocks }] = await Promise.all([
      getNotionPage(input.id, NotionPage),
      getNotionBlocks(input.id),
    ]);

    if (!page) {
      throw errors.NOT_FOUND();
    }

    return { ...page, blocks };
  }),
});

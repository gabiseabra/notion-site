import { implement } from "@orpc/server";
import { api } from "@notion-site/common/dto/orpc/index.js";
import { getBlocks, getPage } from "../../services/notion/blog-posts.js";

const c = implement(api.notion.pages);

export const pages = c.router({
  getPageById: c.getPageById.handler(async ({ input, errors }) => {
    const [page, blocks] = await Promise.all([
      getPage(input.id),
      getBlocks(input.id),
    ]);

    if (!page) {
      throw errors.NOT_FOUND();
    }

    return { ...page, blocks };
  }),
});

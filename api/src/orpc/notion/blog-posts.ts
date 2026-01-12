import { implement } from "@orpc/server";
import { api } from "@notion-site/common/dto/orpc/index.js";
import {
  getBlocks,
  getBlogPost,
  getBlogPosts,
} from "../../services/notion/blog-posts.js";

const c = implement(api.notion.blogPosts);

export const blogPosts = c.router({
  getBlogPosts: c.getBlogPosts.handler(async ({ input }) => {
    return getBlogPosts(input);
  }),

  getBlogPostById: c.getBlogPostById.handler(async ({ input, errors }) => {
    const [post, blocks] = await Promise.all([
      getBlogPost(input.id),
      getBlocks(input.id),
    ]);

    if (!post) {
      throw errors.NOT_FOUND();
    }

    return { ...post, blocks };
  }),
});

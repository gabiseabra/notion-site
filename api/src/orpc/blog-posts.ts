import { implement } from "@orpc/server";
import { api } from "@notion-site/common/dto/orpc/index.js";
import { getBlogPosts } from "../services/notion/blog-posts.js";

const c = implement(api.blogPosts);

export const blogPosts = c.router({
  getBlogPosts: c.getBlogPosts.handler(async ({ input }) => {
    return getBlogPosts(input);
  }),

  getBlogPost: c.getBlogPost.handler(async ({ input }) => {
    throw new Error("noop");
  }),
});

import { implement } from "@orpc/server";
import { api } from "@notion-site/dto/orpc/index.js";
import { getPosts } from "@api/services/notion/posts.js";

const c = implement(api.posts);

export const posts = c.router({
  getPosts: c.getPosts.handler(async ({ input }) => {
    return getPosts(input);
  }),

  getPost: c.getPost.handler(async ({ input }) => {
    throw new Error("noop");
  }),
});

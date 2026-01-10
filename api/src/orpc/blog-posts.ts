import { implement } from "@orpc/server";
import { api } from "@notion-site/common/dto/orpc/index.js";
import {
  getBlocks,
  getBlogPost,
  getBlogPosts,
} from "../services/notion/blog-posts.js";

const c = implement(api.blogPosts);

export const blogPosts = c.router({
  getBlogPosts: c.getBlogPosts.handler(async ({ input }) => {
    return getBlogPosts(input);
  }),

  getBlogPost: c.getBlogPost.handler(async ({ input, errors }) => {
    const [post, blocks] = await Promise.all([
      getBlogPost(input.id),
      getBlocks(input.id),
    ]);

    console.log("!!!", JSON.stringify(blocks, null, 2));

    if (!post) {
      throw errors.NOT_FOUND();
    }

    return post;
  }),
});

import { api } from "@notion-site/common/orpc/index.js";
import { implement } from "@orpc/server";
import { blogPosts } from "./notion/blog-posts.js";
import { pages } from "./notion/pages.js";

const c = implement(api);

export const router = c.router({
  notion: {
    pages,
    blogPosts,
  },
});

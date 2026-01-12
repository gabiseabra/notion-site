import { implement } from "@orpc/server";
import { api } from "@notion-site/common/orpc/index.js";
import { pages } from "./notion/pages.js";
import { blogPosts } from "./notion/blog-posts.js";

const c = implement(api);

export const router = c.router({
  notion: {
    pages,
    blogPosts,
  },
});

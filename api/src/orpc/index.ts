import { implement } from "@orpc/server";
import { api } from "@notion-site/common/dto/orpc/index.js";
import { pages } from "./pages.js";
import { blogPosts } from "./blog-posts.js";

const c = implement(api);

export const router = c.router({
  pages,
  blogPosts,
});

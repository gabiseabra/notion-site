import { implement } from "@orpc/server";
import { api } from "@notion-site/dto/orpc/index.js";
import { blogPosts } from "./blog-posts.js";

const c = implement(api);

export const router = c.router({
  blogPosts,
});

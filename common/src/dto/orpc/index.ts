import { oc } from "@orpc/contract";
import { pages } from "./pages.js";
import { blogPosts } from "./blog-posts.js";

export const api = oc.router({
  pages,
  blogPosts,
});

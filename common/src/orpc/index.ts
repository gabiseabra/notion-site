import { oc } from "@orpc/contract";
import { blogPosts } from "./notion/blog-posts.js";
import { pages } from "./notion/pages.js";

export const api = oc.router({
  notion: {
    pages,
    blogPosts,
  },
});

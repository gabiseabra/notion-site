import { oc } from "@orpc/contract";
import { pages } from "./notion/pages.js";
import { blogPosts } from "./notion/blog-posts.js";

export const api = oc.router({
  notion: {
    pages,
    blogPosts,
  },
});

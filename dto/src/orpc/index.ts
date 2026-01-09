import { oc } from "@orpc/contract";
import { posts } from "./posts.js";

export const api = oc.router({
  posts,
});

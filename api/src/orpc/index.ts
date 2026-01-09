import { implement } from "@orpc/server";
import { api } from "@notion-site/dto/orpc/index.js";
import { posts } from "./posts.js";

const c = implement(api);

export const router = c.router({
  posts,
});

import { api } from "@notion-site/common/orpc/index.js";
import { implement } from "@orpc/server";
import { notion } from "./notion.js";

const c = implement(api);

export const router = c.router({
  notion,
});

import { api } from "@notion-site/common/orpc/index.js";
import { implement } from "@orpc/server";
import { link } from "./link.js";
import { notion } from "./notion.js";

const c = implement(api);

export const router = c.router({
  link,
  notion,
});

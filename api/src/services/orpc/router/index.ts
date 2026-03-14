import { api, context } from "@notion-site/common/orpc/index.js";
import { implement, type Router } from "@orpc/server";
import { link } from "./link.js";
import { notion } from "./notion.js";

const c = implement(api);

export const router: Router<api, context> = c.router({
  link,
  notion,
});

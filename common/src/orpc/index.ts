import { oc } from "@orpc/contract";
import { link } from "./link.js";
import { notion } from "./notion.js";

export const api = oc.router({
  link,
  notion,
});

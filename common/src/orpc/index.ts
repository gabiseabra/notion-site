import { oc } from "@orpc/contract";
import { notion } from "./notion.js";

export const api = oc.router({
  notion,
});

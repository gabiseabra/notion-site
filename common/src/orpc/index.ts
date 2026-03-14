import { oc } from "@orpc/contract";
import { EmptyObject } from "../types/object.js";
import { link } from "./link.js";
import { notion } from "./notion.js";

export const api = oc.router({
  link,
  notion,
});
export type api = typeof api;
export type context = EmptyObject;

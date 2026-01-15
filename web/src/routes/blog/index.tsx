import * as list from "./list.js";
import * as get from "./get.js";
import * as tag from "./tag.js";
import { Outlet } from "react-router";

export const path = "/blog";

export const children = [list, get, tag];

// Example how to provide context for nested routes
const blogPageContext = {
  eyy: "lmao",
} as const;
export type BlogPageContext = typeof blogPageContext;

export function Component() {
  return <Outlet context={blogPageContext} />;
}

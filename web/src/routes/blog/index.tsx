import * as list from "./list.js";
import * as show from "./get.js";
import { Outlet } from "react-router";

export const path = "/blog";

export const children = [list, show];

// Example how to provide context for nested routes
const blogPageContext = {
  eyy: "lmao",
} as const;
export type BlogPageContext = typeof blogPageContext;

export function Component() {
  return <Outlet context={blogPageContext} />;
}

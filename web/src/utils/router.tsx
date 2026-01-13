import { RouteObject } from "react-router";
import * as route from "../routes/index.js";

export function getPathByRouteId(
  id: string,
  routes: RouteObject[] = [route],
  base: string = "/",
): string | undefined {
  for (const route of routes ?? [window.route]) {
    const nextBase = route.index ? base : join(base, route.path);

    if (route.id?.replace(/-/g, "") === id.replace(/-/g, "")) {
      return nextBase;
    }

    if (route.children) {
      const path = getPathByRouteId(id, route.children, nextBase);
      if (path) return path;
    }
  }
}

function join(base: string, segment?: string) {
  return segment
    ? [base.replace(/\/$/, ""), segment.replace(/^\//, "")]
        .join("/")
        .replace(/^$/, "/")
    : base || "/";
}

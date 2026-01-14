import { RouteObject } from "react-router";
import { uuidEquals } from "@notion-site/common/utils/uuid.js";
import * as route from "../routes/index.js";

/**
 * Finds the URL path for a route with the given `id` by walking a react-router routes tree.
 * Route id comparison is normalised by removing hyphens.
 */
export function getPathByRouteId(
  id: string,
  routes: RouteObject[] = [route],
  base: string = "/",
): string | undefined {
  for (const route of routes) {
    const nextBase = route.index ? base : join(base, route.path);

    if (route.id && uuidEquals(route.id, id)) {
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

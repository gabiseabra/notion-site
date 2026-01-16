import { ReactNode } from "react";
import { RouteObject } from "react-router";
import { uuidEquals } from "@notion-site/common/utils/uuid.js";
import { DistributiveOmit } from "@notion-site/common/utils/types.js";
import * as route from "../routes/index.js";

export type ExtendedRouteObject = DistributiveOmit<RouteObject, "children"> & {
  title?: string;
  crumb?: ReactNode;
  children?: ExtendedRouteObject[];
};

/**
 * Finds the URL path for a route with the given `id` by walking a react-router routes tree.
 * Route id comparison is normalised by removing hyphens.
 */
export function getPathByRouteId(
  id: string,
  routes: ExtendedRouteObject[] = [route],
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

export function getRouteById(
  id: string,
  routes: ExtendedRouteObject[] = [route],
): ExtendedRouteObject | undefined {
  for (const route of routes) {
    if (route.id && uuidEquals(route.id, id)) {
      return route;
    }

    if (route.children) {
      const found = getRouteById(id, route.children);
      if (found) return found;
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

import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { Route } from "@notion-site/common/dto/route.js";
import { isUuid, uuidEquals } from "@notion-site/common/utils/uuid.js";
import * as env from "./env.js";

export function getRouteById(id: string): Route | undefined {
  for (const route of env.routes) {
    if (isUuid(route.id) && uuidEquals(route.id, id)) {
      return route;
    } else if (route.path.endsWith("/*")) {
      return { ...route, id, path: route.path.replace("*", id) };
    }
  }
}

export function getRouteByPath(path: string): Route | undefined {
  for (const route of env.routes) {
    if (route.path === path) return route;

    if (!route.path.endsWith("*")) continue;

    const prefix = route.path.slice(0, -1);

    if (!path.startsWith(prefix)) continue;

    const wildcardPart = path.slice(prefix.length);
    const extractedId = extractId(wildcardPart);
    const resolvedId = route.id.replace("*", extractedId);

    return { ...route, id: resolvedId, path };
  }
}

export function getResourceUrl({ id, url, parent }: NotionResource) {
  if (parent.type !== "database_id") {
    return getRouteById(id)?.path;
  } else if (
    env.BLOG_POSTS_DATABASE_ID &&
    uuidEquals(parent.database_id, env.BLOG_POSTS_DATABASE_ID)
  ) {
    return `/blog${url}`;
  }
}

export function matchRoute(pathOrId: string): Route | undefined {
  if (pathOrId.startsWith("/")) return getRouteByPath(pathOrId);

  const id = extractId(pathOrId);

  if (!isUuid(id)) return;

  const route = getRouteById(extractId(pathOrId));

  if (route) return route;

  const fallbackRoute = env.routes.find((r) => r.path.endsWith("/*"));

  if (fallbackRoute) {
    return {
      ...fallbackRoute,
      id: extractId(pathOrId),
      path: fallbackRoute.path.replace("*", id),
    };
  }
}

export function extractId(path: string) {
  return isUuid(path) ? path : path.split("-").pop()!;
}

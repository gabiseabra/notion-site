import { match } from "ts-pattern";
import { isUuid, uuidEquals } from "@notion-site/common/utils/uuid.js";
import { Route } from "@notion-site/common/dto/route.js";
import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import * as env from "./env.js";

export function getRouteById(
  id: string,
  routes: Route[] = env.routes,
): Route | undefined {
  for (const route of routes) {
    if (route.id && uuidEquals(route.id, id)) {
      if (route.path.endsWith("/*")) {
        return { ...route, id, path: route.path.replace("*", id) };
      } else {
        return route;
      }
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
  return (
    getRouteById(id)?.path ??
    match(parent)
      .with({ type: "database_id" }, ({ database_id }) => {
        if (
          env.BLOG_POSTS_DATABASE_ID &&
          uuidEquals(database_id, env.BLOG_POSTS_DATABASE_ID)
        ) {
          return `/blog${url}`;
        }
      })
      .with({ type: "page_id" }, () => `/page${url}`)
      .otherwise(() => undefined)
  );
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

import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { Route } from "@notion-site/common/dto/route.js";
import { hasPropertyValue } from "@notion-site/common/utils/guards.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { isUuid, uuidEquals } from "@notion-site/common/utils/uuid.js";
import slug from "limax";
import * as env from "../env.js";

function getRouteById(pageId: string): Route | undefined {
  const uuid = extractUuid(pageId);

  for (const route of env.routes) {
    if (uuid && uuidEquals(route.id, uuid)) {
      return route;
    }
  }
}

function getRouteByPath(path: string): Route | undefined {
  for (const route of env.routes) {
    // route path matches exactly => pick
    if (route.path === path) return route;
    // route is not wildcard => skip
    if (!route.path.endsWith("*")) continue;
    const prefix = route.path.slice(0, -1);
    // path doesn't start with prefix or is more deep => skip
    if (!path.startsWith(prefix) || path.slice(prefix.length).includes("/"))
      continue;

    const wildcardPart = path.slice(prefix.length);
    const uuid = extractUuid(wildcardPart);
    if (!uuid) continue;

    return {
      ...route,
      id: uuid,
      path: route.path.replace("*", slugify({ id: uuid })),
    };
  }
}

function getFallbackRoute(id: string, resource?: NotionResource) {
  const uuid = extractUuid(id);
  const fallbackRoute = env.routes.find((r) => r.id === "*" && !r.parent);

  if (uuid && fallbackRoute) {
    return {
      ...fallbackRoute,
      id: uuid,
      path: fallbackRoute.path.replace("*", slugify(resource ?? { id: uuid })),
    };
  }
}

export function getRouteByResource(resource: NotionResource) {
  const { id, url, parent } = resource;

  return (
    getRouteById(url) ??
    env.routes
      .filter(
        (r) =>
          r.parent &&
          ((r.parent.type === "database_id" &&
            parent.type === "database_id" &&
            uuidEquals(r.parent.database_id, parent.database_id)) ||
            (r.parent.type === "page_id" &&
              parent.type === "page_id" &&
              uuidEquals(r.parent.page_id, parent.page_id)) ||
            r.parent.type === parent.type),
      )
      .map((route) => ({
        ...route,
        id,
        path: route.path.replace("*", slugify(resource)),
      }))
      .pop() ??
    getFallbackRoute(url, resource)
  );
}

export function matchRoute(pathOrId: string): Route | undefined {
  return (
    getRouteById(pathOrId) ??
    getRouteByPath(pathOrId) ??
    getFallbackRoute(pathOrId)
  );
}

export function extractUuid(id: string) {
  if (isUuid(id)) return id;
  const uuidPart = id.split("-").pop();
  if (!uuidPart || !isUuid(uuidPart)) return;
  return uuidPart;
}

function slugify({
  id,
  properties,
}: {
  id: string;
  properties?: zNotion.properties.Properties;
}) {
  const title =
    properties &&
    Object.values(properties).find(hasPropertyValue("type", "title"));
  const titleSlug =
    title && slug(Notion.titleToString(title) ?? "", { tone: false });

  if (!titleSlug) return id;

  return `${titleSlug}-${id}`;
}

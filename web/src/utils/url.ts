import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { match } from "ts-pattern";
import { getPathByRouteId } from "./router.js";
import { uuidEquals } from "@notion-site/common/utils/uuid.js";

const SITE_URL: string = import.meta.env.VITE_SITE_URL;
const BLOG_POSTS_DATABASE_ID: string =
  import.meta.env.VITE_BLOG_POSTS_DATABASE_ID ?? "";

export function rewriteUrl(url: string) {
  if (url.startsWith(SITE_URL)) {
    return url.slice(SITE_URL.length);
  } else {
    return url;
  }
}

export function getResourceUrl({ id, url, parent }: NotionResource) {
  return (
    getPathByRouteId(id) ??
    match(parent)
      .with({ type: "database_id" }, ({ database_id }) => {
        if (uuidEquals(database_id, BLOG_POSTS_DATABASE_ID)) {
          return `/blog${url}`;
        }
      })
      .with({ type: "page_id" }, () => `/pages${url}`)
      .otherwise(() => undefined)
  );
}

/**
 * @module routes/url.ts
 * Route-aware URL utilities.
 */
import { NotionDatabase } from "@notion-site/common/dto/notion/database.js";
import { match } from "ts-pattern";

const SITE_URL: string = import.meta.env.VITE_SITE_URL;
const BLOG_POSTS_DATABASE_ID: string = import.meta.env
  .VITE_BLOG_POSTS_DATABASE_ID;

export function rewriteUrl(url: string) {
  if (url.startsWith(SITE_URL)) {
    return url.slice(SITE_URL.length);
  } else {
    return url;
  }
}

export function getResourceUrl({ url, parent }: NotionDatabase) {
  return match(parent)
    .with({ type: "database_id" }, ({ database_id }) => {
      if (
        database_id.replace(/-/g, "") ===
        BLOG_POSTS_DATABASE_ID.replace(/-/g, "")
      ) {
        return `/blog/${url}`;
      }
    })
    .with({ type: "page_id" }, () => `/pages/${url}`)
    .otherwise(() => undefined);
}

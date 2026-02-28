import * as env from "../../env.js";
import { fetchRPCHandler } from "../orpc/handler.js";
import { createFetch } from "./fetch.js";
import { ViteServer } from "./server.js";

export async function render(url: string, apiPrefix: `/${string}`) {
  const apiUrl = `${env.SITE_URL}${apiPrefix}`;

  return ViteServer.withModule(
    "./src/rss.tsx",
    () => import("@notion-site/web/rss.js"),
    ({ render }) =>
      render(url, {
        apiUrl,
        fetch: createFetch({
          prefix: apiPrefix,
          handler: fetchRPCHandler,
          headers: new Headers([]),
        }),
      }),
  );
}

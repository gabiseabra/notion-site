import { EmptyObject } from "@notion-site/common/types/object.js";
import { RPCHandler } from "@orpc/server/fetch";
import express from "express";
import { PassThrough } from "stream";
import { createFetch } from "./fetch.js";
import { ViteServer } from "./server.js";

export function viteMiddleware(
  apiPrefix: `/${string}`,
  handler?: RPCHandler<EmptyObject>,
) {
  const router = express.Router();

  router.use(async (req, res) => {
    const url = req.originalUrl;
    const apiUrl = `${req.protocol}://${req.get("host")}${apiPrefix}`;

    const result = await ViteServer.withModule(
      "./src/server.tsx",
      () => import("@notion-site/web/server.js"),
      ({ render }) =>
        render(url, {
          apiUrl,
          fetch:
            handler &&
            createFetch({
              prefix: apiPrefix,
              handler,
              headers: new Headers(
                Object.entries(req.headers).reduce<[string, string][]>(
                  (acc, [k, v]) => {
                    if (Array.isArray(v))
                      v.forEach((val) => acc.push([k, val]));
                    else if (typeof v === "string") acc.push([k, v]);
                    return acc;
                  },
                  [],
                ),
              ),
            }),
        }),
    );

    if (result instanceof Response) {
      const redirectTo = result.headers.get("Location");

      if (redirectTo) {
        return res.redirect(result.status, redirectTo);
      } else {
        const body = await result.text();
        return res.status(result.status).send(body);
      }
    }

    const [head, tail] = ViteServer.template.split("<!--app-html-->");
    const stream = new PassThrough();

    res.status(result.status).set({ "Content-Type": "text/html" });

    res.write(head ?? "");
    result.pipe(stream);
    stream.pipe(res, { end: false });
    res.on("close", () => {
      result.abort?.();
    });
    stream.on("end", () => {
      res.end(tail ?? "");
    });
  });

  return router;
}

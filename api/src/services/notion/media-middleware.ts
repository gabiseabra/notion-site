import type { NextFunction, Request, Response } from "express";
import { httpError } from "../../utils/http-error.js";
import { getNotionMediaBlock } from "./api.js";

export async function notionMediaMiddleware(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const block = await getNotionMediaBlock(req.params.id);

    if (!block) {
      httpError(404, `Media ${req.params.id} not found`);
    }

    const url =
      block.image.type === "external"
        ? block.image.external.url
        : block.image.file.url;

    const response = await fetch(url);

    res.setHeader(
      "cache-control",
      "public, max-age=3600, stale-while-revalidate=86400",
    );

    for (const header of ["content-type", "content-length", "etag"]) {
      res.setHeader(header, response.headers.get(header) ?? "");
    }

    res.status(response.status);

    if (response.status === 304) {
      res.end();
      return;
    }

    if (!response.ok || !response.body) {
      httpError(502, `Failed to fetch media ${req.params.id}`);
    }

    await response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          if (res.write(chunk)) return;

          return new Promise<void>((resolve) => {
            res.once("drain", resolve);
          });
        },
        close() {
          res.end();
        },
        abort() {
          res.destroy();
        },
      }),
    );
  } catch (error) {
    next(error);
  }
}

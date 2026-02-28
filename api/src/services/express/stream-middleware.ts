import type { NextFunction, Request, Response } from "express";
import { Readable } from "node:stream";

export type StreamResult = {
  status: number;
  pipe: (destination: NodeJS.WritableStream) => void;
  abort?: () => void;
  headers?: Headers | Record<string, string>;
};

export type StreamHandler = (
  req: Request,
  res: Response,
) => Promise<StreamResult | Readable>;

export function streamMiddleware(handler: StreamHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await handler(req, res);

      if (isStreamResult(result)) {
        if (result.headers) {
          if (result.headers instanceof Headers) {
            for (const [key, value] of result.headers.entries()) {
              res.setHeader(key, value);
            }
          } else {
            for (const [key, value] of Object.entries(result.headers)) {
              res.setHeader(key, value);
            }
          }
        }

        res.status(result.status);
        result.pipe(res);

        if (result.abort) {
          res.on("close", () => result.abort?.());
        }
      } else {
        res.status(200);
        result.pipe(res);
      }
    } catch (error) {
      next(error);
    }
  };
}

function isStreamResult(value: StreamResult | Readable): value is StreamResult {
  return typeof (value as StreamResult).status === "number";
}

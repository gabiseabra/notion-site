import { EmptyObject } from "@notion-site/common/types/object.js";
import { RPCHandler } from "@orpc/server/node";
import { Router } from "express";

export function orpcMiddleware(
  prefix: `/${string}`,
  handler: RPCHandler<EmptyObject>,
) {
  const router = Router();

  router.use(prefix, async (req, res, next) => {
    const { matched } = await handler.handle(req, res, {
      prefix,
      context: {},
    });

    if (matched) return;

    next();
  });

  return router;
}

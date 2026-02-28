import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../utils/http-error.js";

export function httpErrorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof HttpError) {
    res.status(error.status).send(error.message);
    return;
  }

  next(error);
}

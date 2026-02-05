import { Route } from "@notion-site/common/dto/route.js";
import path from "path";
import { fileURLToPath } from "url";

export const DEV = false;

export const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);

export const WEB_ROOT = path.resolve(API_ROOT, "../web");

export const CLIENT_DIST = path.resolve(WEB_ROOT, "dist/client");

export const SERVER_DIST = path.resolve(WEB_ROOT, "dist/server");

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const CORS_ORIGIN = `http://localhost:${PORT}`;
export const BLOG_POSTS_DATABASE_ID = "123";
export const routes: Route[] = [];

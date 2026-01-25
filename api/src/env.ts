import { Route } from "@notion-site/common/dto/route.js";
import { never } from "@notion-site/common/utils/error.js";
import fs from "fs";
import JSON5 from "json5";
import path from "path";
import { fileURLToPath } from "url";

export const DEV = process.env.NODE_ENV !== "production";

export const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  DEV ? "../" : "../../",
);

export const WEB_ROOT = path.resolve(API_ROOT, "../web");

export const CLIENT_DIST = path.resolve(WEB_ROOT, "dist/client");

export const SERVER_DIST = path.resolve(WEB_ROOT, "dist/server");

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const CORS_ORIGIN = DEV
  ? `http://localhost:${PORT}`
  : process.env.CORS_ORIGIN;

export const BLOG_POSTS_DATABASE_ID = process.env.NOTION_BLOG_POSTS_DATABASE_ID;

const ROUTES_FILE = process.env.ROUTES_FILE;
const ROUTES_JSON = process.env.ROUTES_JSON;

export const routes = Route.array().parse(
  JSON5.parse(
    ROUTES_JSON ??
      fs.readFileSync(
        ROUTES_FILE ?? never("Routes are not configured!"),
        "utf8",
      ),
  ),
);

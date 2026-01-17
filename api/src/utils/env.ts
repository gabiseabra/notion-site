import fs from "fs";
import { never } from "@notion-site/common/utils/error.js";
import { Route } from "@notion-site/common/dto/route.js";
import JSON5 from "json5";

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const STATIC_DIR = process.env.STATIC_DIR;

export const CORS_ORIGIN =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${PORT}`
    : process.env.CORS_ORIGIN;

export const BLOG_POSTS_DATABASE_ID = process.env.NOTION_BLOG_POSTS_DATABASE_ID;

const ROUTES_FILE = process.env.ROUTES_FILE;
const ROUTES_JSON = process.env.ROUTES_JSON;

console.log(ROUTES_FILE);

export const routes = Route.array().parse(
  JSON5.parse(
    ROUTES_JSON ??
      fs.readFileSync(
        ROUTES_FILE ?? never("Routes are not configured!"),
        "utf8",
      ),
  ),
);

import { BlogPost } from "@notion-site/common/dto/blog-posts/index.js";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import * as env from "./env.js";
import { httpErrorMiddleware } from "./services/express/http-error-middleware.js";
import { streamMiddleware } from "./services/express/stream-middleware.js";
import { BlogPostsDB } from "./services/notion/database/blog-posts.js";
import { createNotionDatabaseFeed } from "./services/notion/feed.js";
import { notionMediaMiddleware } from "./services/notion/media-middleware.js";
import { nodeRPCHandler } from "./services/orpc/handler.js";
import { orpcMiddleware } from "./services/orpc/middleware.js";
import { ViteServer } from "./services/vite/server.js";
import { httpError } from "./utils/http-error.js";

async function createServer() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(morgan("dev"));

  app.get(
    "/feed",
    streamMiddleware(() =>
      !env.BLOG_POSTS_DATABASE_ID
        ? httpError(502, `Blog posts database not implemented`)
        : createNotionDatabaseFeed(
            env.BLOG_POSTS_DATABASE_ID,
            BlogPost,
            BlogPostsDB.feedOptions({
              query: "",
              limit: 25,
            }),
          ),
    ),
  );

  app.get("/api/media/:id", notionMediaMiddleware);

  app.use(orpcMiddleware("/api", nodeRPCHandler));

  app.use(httpErrorMiddleware);

  const server = app.listen(env.PORT, () => {
    console.log(`Running a API server on http://localhost:${env.PORT}`);
  });

  let isShuttingDown = false;
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    try {
      await ViteServer.close();
    } finally {
      server.close(() => {
        console.log("HTTP server closed");
      });
    }
  };

  await ViteServer.start();

  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
  process.once("exit", () => void shutdown());
}

createServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

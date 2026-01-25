import { onError } from "@orpc/server";
import { RPCHandler as FetchRPCHandler } from "@orpc/server/fetch";
import { RPCHandler } from "@orpc/server/node";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import * as env from "./env.js";
import { orpcMiddleware } from "./services/orpc/middleware.js";
import { router } from "./services/orpc/router/index.js";
import { viteMiddleware } from "./services/vite/middleware.js";
import { ViteServer } from "./services/vite/server.js";

async function createServer() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(morgan("dev"));

  const handler = new RPCHandler(router, {
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });

  const ssrHandler = new FetchRPCHandler(router, {
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });

  app.use(orpcMiddleware("/api", handler));

  app.use(viteMiddleware("/api", ssrHandler));

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

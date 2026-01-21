import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { router } from "./orpc/index.js";
import * as env from "./utils/env.js";

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

app.use("/api", async (req, res, next) => {
  const { matched } = await handler.handle(req, res, {
    prefix: "/api",
    context: {},
  });

  if (matched) return;

  next();
});

if (env.STATIC_DIR) {
  app.use(express.static(env.STATIC_DIR));

  app.use((req, res) => {
    res.sendFile(path.join(env.STATIC_DIR!, "index.html"));
  });
}

// Start the server at port
const server = app.listen(env.PORT, () => {
  console.log(`Running a API server on http://localhost:${env.PORT}`);
});

const shutdown = () => {
  server.close(() => {
    console.log("HTTP server closed");
  });
};

process.on("exit", shutdown);
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

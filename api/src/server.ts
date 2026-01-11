import express from "express";
import cors from "cors";
import morgan from "morgan";
import { RPCHandler } from "@orpc/server/node";
import { onError } from "@orpc/server";
import { router } from "./orpc/index.js";

const port = process.env.BE_PORT || 3000;
const app = express();

app.use(cors({ origin: `http://localhost:${port}` }));
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

// Start the server at port
const server = app.listen(port, () => {
  console.log(`Running a API server on http://localhost:${port}`);
});

const shutdown = () => {
  server.close(() => {
    console.log("HTTP server closed");
  });
};

process.on("exit", shutdown);
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

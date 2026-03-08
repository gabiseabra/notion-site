import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import { RootPovider } from "./providers/RootProvider.js";
import * as route from "./routes/rss.js";

const routes = [route];
const handler = createStaticHandler(routes);

export type RenderResult = {
  status: number;
  pipe: (destination: NodeJS.WritableStream) => void;
  abort: () => void;
};

export type Fetch = typeof fetch;

export type RenderOptions = {
  apiUrl: string;
  fetch?: Fetch;
  redirect?: number;
};

export type Render = typeof render;

export async function render(
  url: string,
  { apiUrl, fetch, redirect = 5 }: RenderOptions,
  depth = 0,
): Promise<RenderResult> {
  const request = new Request(new URL(url, "http://localhost"), {
    method: "GET",
  });

  let context = await handler.query(request);

  if (context instanceof Response) {
    const location = context.headers.get("Location");
    if (location) {
      if (depth >= redirect) {
        throw new Error(`Redirect limit exceeded (${redirect}) for ${url}`);
      }

      const nextUrl = new URL(location, request.url);
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      return await render(nextPath, { apiUrl, fetch, redirect }, depth + 1);
    }

    const detail = await context.text();
    throw new Error(
      `Unexpected response (${context.status}) for ${url}: ${detail || "no body"}`,
    );
  }

  const router = createStaticRouter(routes, context);

  return await new Promise<RenderResult>((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <React.StrictMode>
        <RootPovider platform="rss" url={apiUrl} fetch={fetch}>
          <StaticRouterProvider
            router={router}
            context={context}
            hydrate={false}
          />
        </RootPovider>
      </React.StrictMode>,
      {
        onAllReady() {
          resolve({
            status: didError ? 500 : (context.statusCode ?? 200),
            pipe,
            abort,
          });
        },
        onShellError(error) {
          reject(error);
        },
        onError() {
          didError = true;
        },
      },
    );
  });
}

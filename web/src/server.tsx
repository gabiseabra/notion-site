import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import { HeadProvider } from "./providers/HeadProvider.js";
import { OrpcProvider } from "./providers/OrpcProvider.js";
import * as route from "./routes/index.js";

const routes = [route];
const handler = createStaticHandler(routes);

export type RenderResult =
  | {
      status: number;
      pipe: (destination: NodeJS.WritableStream) => void;
      abort: () => void;
    }
  | Response;

export type Fetch = typeof fetch;

export type RenderOptions = {
  apiUrl: string;
  fetch?: Fetch;
};

export type Render = typeof render;

export async function render(
  url: string,
  { apiUrl, fetch }: RenderOptions,
): Promise<RenderResult> {
  const request = new Request(new URL(url, "http://localhost"), {
    method: "GET",
  });

  const context = await handler.query(request);

  if (context instanceof Response) {
    return context;
  }

  const router = createStaticRouter(routes, context);

  return await new Promise<RenderResult>((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <React.StrictMode>
        <OrpcProvider url={apiUrl} fetch={fetch}>
          <HeadProvider>
            <StaticRouterProvider router={router} context={context} />
          </HeadProvider>
        </OrpcProvider>
      </React.StrictMode>,
      {
        onShellReady() {
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

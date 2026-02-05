import "./css/global.scss";

import React from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import * as env from "./env.js";
import { RootPovider } from "./providers/RootProvider.js";
import * as route from "./routes/index.js";

const router = createBrowserRouter([route]);
const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

hydrateRoot(
  root,
  <React.StrictMode>
    <RootPovider url={env.API_URL}>
      <RouterProvider router={router} />
    </RootPovider>
  </React.StrictMode>,
);

import "./css/global.scss";

import React from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import * as env from "./env.js";
import { HeadProvider } from "./providers/HeadProvider.js";
import { OrpcProvider } from "./providers/OrpcProvider.js";
import * as route from "./routes/index.js";

const router = createBrowserRouter([route]);
const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

hydrateRoot(
  root,
  <React.StrictMode>
    <OrpcProvider url={env.API_URL}>
      <HeadProvider>
        <RouterProvider router={router} />
      </HeadProvider>
    </OrpcProvider>
  </React.StrictMode>,
);

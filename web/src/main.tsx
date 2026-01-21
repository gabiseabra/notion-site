import "./css/global.scss";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { HeadProvider } from "./providers/HeadProvider.js";
import { OrpcProvider } from "./providers/OrpcProvider.js";
import * as route from "./routes/index.js";

const router = createBrowserRouter([route]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OrpcProvider>
      <HeadProvider>
        <RouterProvider router={router} />
      </HeadProvider>
    </OrpcProvider>
  </React.StrictMode>,
);

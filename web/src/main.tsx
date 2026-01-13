import "./css/global.scss";

import React from "react";
import ReactDOM from "react-dom/client";
import { OrpcProvider } from "./providers/OrpcProvider.js";
import { createBrowserRouter, RouterProvider } from "react-router";
import * as route from "./routes/index.js";

const router = createBrowserRouter([route]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OrpcProvider>
      <RouterProvider router={router} />
    </OrpcProvider>
  </React.StrictMode>,
);

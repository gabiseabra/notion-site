import "./css/global.scss";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrpcProvider } from "./providers/OrpcProvider.js";
import { RouterProvider } from "react-router";
import { createRouter } from "./pages/router.js";

const queryClient = new QueryClient();

function AppWithRouter() {
  const router = createRouter();
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OrpcProvider>
      <QueryClientProvider client={queryClient}>
        <AppWithRouter />
      </QueryClientProvider>
    </OrpcProvider>
  </React.StrictMode>,
);

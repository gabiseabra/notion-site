import "./styles/global.scss";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrpcProvider } from "./components/providers/OrpcProvider.js";
import App from "./App.js";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OrpcProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </OrpcProvider>
  </React.StrictMode>,
);

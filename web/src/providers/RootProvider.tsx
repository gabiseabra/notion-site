import { ReactNode } from "react";
import { Platform } from "../components/layout/Platform.js";
import { HeadProvider } from "./HeadProvider.js";
import { OrpcProvider } from "./OrpcProvider.js";

type Fetch = typeof fetch;

export function RootPovider({
  url = "/api",
  fetch,
  platform,
  children,
}: {
  url?: string;
  fetch?: Fetch;
  platform: Platform;
  children: ReactNode;
}) {
  return (
    <Platform.Provider value={platform}>
      <OrpcProvider url={url} fetch={fetch}>
        <HeadProvider>{children}</HeadProvider>
      </OrpcProvider>
    </Platform.Provider>
  );
}

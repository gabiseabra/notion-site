import { ReactNode } from "react";
import { HeadProvider } from "./HeadProvider.js";
import { OrpcProvider } from "./OrpcProvider.js";

type Fetch = typeof fetch;

export function RootPovider({
  url = "/api",
  fetch,
  children,
}: {
  url?: string;
  fetch?: Fetch;
  children: ReactNode;
}) {
  return (
    <OrpcProvider url={url} fetch={fetch}>
      <HeadProvider>{children}</HeadProvider>
    </OrpcProvider>
  );
}

import { api } from "@notion-site/common/orpc/index.js";
import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { SimpleCsrfProtectionLinkPlugin } from "@orpc/client/plugins";
import {
  ContractRouterClient,
  inferRPCMethodFromContractRouter,
} from "@orpc/contract";
import { createContext, ReactNode, useContext, useMemo } from "react";

export type OrpcContext = ContractRouterClient<typeof api>;
const OrpcContext = createContext<OrpcContext | null>(null);

export function useOrpc() {
  const client = useContext(OrpcContext);

  if (!client) {
    throw new Error("oRPC client not found");
  }

  return client;
}

export function OrpcProvider({ children }: { children: ReactNode }) {
  const url = `${import.meta.env.VITE_API_URL ?? window.location.origin}/api`;

  const link = useMemo(
    () =>
      new RPCLink({
        url,
        method: inferRPCMethodFromContractRouter(api),
        plugins: [new SimpleCsrfProtectionLinkPlugin()],
        interceptors: [
          onError((error) => {
            console.error(error);
          }),
        ],
      }),
    [],
  );

  const client: ContractRouterClient<typeof api> = useMemo(
    () => createORPCClient(link),
    [link],
  );

  return <OrpcContext.Provider value={client}>{children}</OrpcContext.Provider>;
}

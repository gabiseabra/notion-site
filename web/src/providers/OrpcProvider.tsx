import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import {
  ContractRouterClient,
  inferRPCMethodFromContractRouter,
} from "@orpc/contract";
import { api } from "@notion-site/common/dto/orpc/index.js";
import {
  BatchLinkPlugin,
  SimpleCsrfProtectionLinkPlugin,
} from "@orpc/client/plugins";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { createTanstackQueryUtils, RouterUtils } from "@orpc/tanstack-query";

const OrpcContext = createContext<RouterUtils<
  ContractRouterClient<typeof api>
> | null>(null);

export function useOrpc() {
  const client = useContext(OrpcContext);

  if (!client) {
    throw new Error("oRPC client not found");
  }

  return client;
}

export function OrpcProvider({ children }: { children: ReactNode }) {
  const url = `${window.location.origin}/api`;

  const link = useMemo(
    () =>
      new RPCLink({
        url,
        method: inferRPCMethodFromContractRouter(api),
        plugins: [
          new BatchLinkPlugin({
            groups: [{ condition: () => true, context: {} }],
          }),
          new SimpleCsrfProtectionLinkPlugin(),
        ],
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
  const orpc = createTanstackQueryUtils(client);

  return <OrpcContext.Provider value={orpc}>{children}</OrpcContext.Provider>;
}

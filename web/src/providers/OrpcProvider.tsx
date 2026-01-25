import { api } from "@notion-site/common/orpc/index.js";
import { hash } from "@notion-site/common/utils/hash.js";
import { ClientContext, createORPCClient, onError } from "@orpc/client";
import { RPCLink, RPCLinkOptions } from "@orpc/client/fetch";
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

export function OrpcProvider({
  children,
  ...options
}: {
  children: ReactNode;
} & Pick<RPCLinkOptions<ClientContext>, "url" | "fetch">) {
  const link = useMemo(
    () =>
      new RPCLink({
        ...options,
        method: inferRPCMethodFromContractRouter(api),
        plugins: [new SimpleCsrfProtectionLinkPlugin()],
        interceptors: [
          onError((error) => {
            console.error(error);
          }),
        ],
      }),
    [fetch, hash(options)],
  );

  const client: ContractRouterClient<typeof api> = useMemo(
    () => createORPCClient(link),
    [link],
  );

  return <OrpcContext.Provider value={client}>{children}</OrpcContext.Provider>;
}

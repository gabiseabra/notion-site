import { EmptyObject } from "@notion-site/common/utils/types.js";
import { Fetch } from "@notion-site/web/server.js";
import { RPCHandler } from "@orpc/server/fetch";

export function createFetch({
  prefix,
  handler,
  headers,
}: {
  prefix: `/${string}`;
  handler: RPCHandler<EmptyObject>;
  headers: Headers;
}): Fetch {
  return async (input, init) => {
    const request =
      input instanceof Request
        ? new Request(input, { ...init, headers })
        : new Request(input, { ...init, headers });

    const { matched, response } = await handler.handle(request, {
      prefix,
      context: {},
    });

    if (matched && response) {
      return response;
    }

    return fetch(request);
  };
}

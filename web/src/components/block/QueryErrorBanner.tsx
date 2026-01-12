import { UseQueryResult } from "@tanstack/react-query";
import { Banner } from "./Banner.js";
import { ORPCError } from "@orpc/client";

export function QueryErrorBanner({
  query,
  fallback,
}: {
  query: UseQueryResult<unknown>;
  fallback: string;
}) {
  if (!query.isError) return null;

  return (
    <Banner type="error">{extractErrorMessage(query.error) ?? fallback}</Banner>
  );
}

function extractErrorMessage(error: unknown) {
  if (error instanceof ORPCError) {
    return error.message;
  }
  return null;
}

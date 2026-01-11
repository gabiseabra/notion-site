import { UseQueryResult } from "@tanstack/react-query";
import { Banner } from "./Banner.js";

export function QueryErrorBanner({
  query,
  fallback,
}: {
  query: UseQueryResult<unknown>;
  fallback: string;
}) {
  if (!query.isError) return null;
  console.log(query.error);
  return <Banner type="error">{fallback}</Banner>;
}

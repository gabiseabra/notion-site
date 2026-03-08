import { never } from "@notion-site/common/utils/error.js";
import { createContext, ReactNode, useContext } from "react";

export type Platform = "rss" | "web";

const PlatformContext = createContext<Platform | undefined>(undefined);

export function usePlatform() {
  return (
    useContext(PlatformContext) ?? never("Platform context not initialized")
  );
}

function PlatformOnly({
  platform: p,
  children,
}: {
  platform: Platform;
  children: ReactNode;
}) {
  const platform = usePlatform();

  if (p === platform) return children;
  return null;
}

function PlatformSwitch(platforms: Record<Platform, ReactNode>) {
  const platform = usePlatform();

  return platforms[platform] ?? null;
}

export const Platform = {
  RSS: (props: { children: ReactNode }) => (
    <PlatformOnly platform="rss" {...props} />
  ),

  Web: (props: { children: ReactNode }) => (
    <PlatformOnly platform="web" {...props} />
  ),

  Switch: PlatformSwitch,

  Provider: PlatformContext.Provider,
};

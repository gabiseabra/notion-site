import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, searchForWorkspaceRoot } from "vite";

const SITE_TUNNEL = process.env.SITE_TUNNEL;
const VITE_PORT = parseInt(process.env.VITE_PORT || "3030", 10);
const PORT = parseInt(process.env.PORT || "3000", 10);

export default defineConfig(({ isSsrBuild, mode }) => ({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias:
      mode !== "test"
        ? {
            "@notion-site/common": resolve("../common/src/"),
          }
        : undefined,
  },
  server: {
    port: VITE_PORT + (mode === "test" ? 1 : 0),
    allowedHosts: SITE_TUNNEL ? [SITE_TUNNEL] : undefined,
    fs: {
      allow: [searchForWorkspaceRoot(__dirname)],
    },
    proxy: {
      "/feed": `http://localhost:${PORT}`,
      "/api": {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: isSsrBuild
    ? {
        ssr: true,
        outDir: "dist/server",
        rollupOptions: {
          input: {
            server: "src/server.tsx",
            env: "src/env.ts",
          },
        },
      }
    : {
        outDir: "dist/client",
      },
}));

import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

const VITE_PORT = parseInt(process.env.VITE_PORT || "3030", 10);
const PORT = parseInt(process.env.PORT || "3000", 10);

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@notion-site/common": resolve(__dirname, "../common/src"),
    },
  },
  server: {
    port: VITE_PORT,
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

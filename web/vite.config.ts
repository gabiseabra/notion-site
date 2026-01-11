import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [resolve(__dirname, "src")],
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@notion-site/common": resolve(__dirname, "../common/src"),
    },
  },
  server: {
    port: 3030,
    proxy: {
      "/feed": "http://localhost:3000",
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

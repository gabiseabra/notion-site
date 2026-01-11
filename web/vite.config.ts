import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PORT = parseInt(process.env.PORT || "3000", 10);
const BE_PORT = parseInt(process.env.BE_PORT || "3030", 10);

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
    port: PORT,
    proxy: {
      "/feed": `http://localhost:${BE_PORT}`,
      "/api": {
        target: `http://localhost:${BE_PORT}`,
        changeOrigin: true,
      },
    },
  },
});

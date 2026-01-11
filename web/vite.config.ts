import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const VITE_PORT = parseInt(process.env.VITE_PORT || "3030", 10);
const PORT = parseInt(process.env.PORT || "3000", 10);

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
    port: VITE_PORT,
    proxy: {
      "/feed": `http://localhost:${PORT}`,
      "/api": {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
});

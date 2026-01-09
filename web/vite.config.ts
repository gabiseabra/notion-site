import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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

import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: () => import("./web/vite.config.ts"),
    },
    excludeSpecPattern: ["**/dist/**/*"],
  },

  // why not set this to false by default . . . ?
  allowCypressEnv: false,
});

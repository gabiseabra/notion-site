import { readFile } from "fs/promises";
import path from "path";
import * as env from "../../env.js";

let vite: import("vite").ViteDevServer | undefined;

export const ViteServer = {
  template: "",

  async close() {
    return vite?.close();
  },

  async start() {
    if (env.DEV) {
      const { createServer: createViteServer } = await import("vite");
      vite = await createViteServer({
        root: env.WEB_ROOT,
        server: { middlewareMode: true },
        appType: "custom",
      });
      this.template = await readFile(
        path.resolve(env.WEB_ROOT, "index.html"),
        "utf-8",
      );
    } else {
      this.template = await readFile(
        path.resolve(env.CLIENT_DIST, "index.html"),
        "utf-8",
      );
    }
  },

  async withModule<T, Out>(
    src: string,
    fallback: () => Promise<T>,
    fn: (module: T) => Out,
  ) {
    if (!vite) {
      if (!fallback) {
        throw new Error(`Failed to import vite module: ${src}`);
      }

      return fn(await fallback());
    }

    try {
      return fn((await vite.ssrLoadModule(src)) as T);
    } catch (error) {
      if (error instanceof Error) {
        vite.ssrFixStacktrace(error);
      }
      throw error;
    }
  },
};

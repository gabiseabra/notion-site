import { NotionResource } from "@notion-site/common/dto/notion/resource.js";
import { Notion } from "@notion-site/common/utils/notion/index.js";
import { Feed, Item } from "feed";
import { PassThrough, Readable } from "node:stream";
import { match } from "ts-pattern";
import z from "zod";
import * as env from "../../env.js";
import { replaceTokenWithStream } from "../../utils/replace-token-stream.js";
import { getRouteByResource } from "../../utils/route.js";
import { render } from "../vite/render.js";
import { ViteServer } from "../vite/server.js";
import { queryNotionDatabase, QueryNotionDatabaseOptions } from "./api.js";

export async function createNotionDatabaseFeed<DB extends NotionResource>(
  databaseId: string,
  schema: z.ZodSchema<DB>,
  options: QueryNotionDatabaseOptions<DB> & {
    feedItem?: (post: DB) => Omit<Partial<Item>, "content">;
  },
) {
  const posts = await queryNotionDatabase(databaseId, schema, options);

  const updated = new Date(
    Math.max(...posts.results.map((post) => post.last_edited_time.getTime())),
  );

  const { image, favicon } = await ViteServer.withModule(
    "./src/env.ts",
    () => import("@notion-site/web/env.js"),
    (env) => ({
      image: env.SITE_IMAGE,
      favicon: env.SITE_FAVICON,
    }),
  );

  const normalizePath = (path: string) =>
    `/${path}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/";

  const toAbsoluteUrl = (value: string) =>
    new URL(
      normalizePath(value),
      env.SITE_URL ?? "http://localhost",
    ).toString();

  const feed = new Feed({
    title: env.SITE_TITLE ?? "Notion Site",
    description: "This is not a tech blog!",
    id: env.SITE_URL,
    link: env.SITE_URL,
    language: "en",
    image: image ? toAbsoluteUrl(image) : undefined,
    favicon: favicon ? toAbsoluteUrl(favicon) : undefined,
    copyright: "Gabi Seabra (c) 2025",
    updated,
    // feedLinks: {
    //   json: "https://example.com/json",
    //   atom: "https://example.com/atom",
    // },
    // author: {
    //   name: "John Doe",
    //   email: "johndoe@example.com",
    //   link: "https://example.com/johndoe",
    // },
  });

  for (const post of posts.results) {
    const title = Object.values(post.properties).find(
      (prop) => prop.type === "title",
    );

    const path = normalizePath(getRouteByResource(post)?.path ?? "");
    const link = env.SITE_URL ? new URL(path, env.SITE_URL).toString() : path;

    feed.addItem({
      title: Notion.RTF.getContent(title?.title ?? []),
      id: post.id,
      link,
      content: `<!-- ${post.id} -->`,
      date: post.last_edited_time,
      image: post.cover
        ? match(post.cover)
            .with({ type: "external" }, (img) => img.external.url)
            .with({ type: "file" }, (img) => img.file.url)
            .exhaustive()
        : undefined,
      ...options.feedItem?.(post),
    });
  }

  let stream: Readable = Readable.from([feed.rss2()]);

  for (const post of posts.results) {
    const url = normalizePath(getRouteByResource(post)?.path ?? "/");

    stream = stream.pipe(
      replaceTokenWithStream(`<!-- ${post.id} -->`, async () => {
        const pass = new PassThrough();
        const result = await render(url, "/api");
        result.pipe(pass);
        return pass;
      }),
    );
  }

  return stream;
}

import { api } from "@notion-site/common/orpc/index.js";
import { implement } from "@orpc/server";
import { CheerioAPI, load } from "cheerio";
const c = implement(api.link);

export const link = c.router({
  getPreview: c.getPreview.handler(async ({ input, errors }) => {
    const response = await fetch(input.url, { redirect: "follow" }).catch(
      (error) => {
        const detail =
          error instanceof Error && error.message
            ? error.message
            : String(error);

        throw errors.REQUEST_FAILED({
          message: `Failed to fetch ${input.url}: ${detail}`,
        });
      },
    );

    if (response.status === 404 || response.status === 410) {
      throw errors.NOT_FOUND({
        message: `Link not found (${response.status}): ${input.url}`,
      });
    }

    if (!response.ok) {
      throw errors.REQUEST_FAILED({
        message: `Failed to fetch ${input.url}: ${response.status} ${response.statusText}`,
      });
    }

    const html = await response.text();
    const baseUrl = response.url || input.url;
    const $ = load(html);
    const meta = extractMeta($);

    const title =
      meta["og:title"] || meta["twitter:title"] || extractTitle($) || baseUrl;

    const description =
      meta["og:description"] ||
      meta["description"] ||
      meta["twitter:description"];

    const image = meta["og:image"] || meta["twitter:image"];
    const favicon = extractFavicon($);

    return {
      title: title.replace(/\s+/g, " ").trim(),
      description: description
        ? description.replace(/\s+/g, " ").trim()
        : undefined,
      image: image ? resolveUrl(image, baseUrl) : undefined,
      favicon: favicon ? resolveUrl(favicon, baseUrl) : undefined,
    };
  }),
});

/** @internal */
function extractTitle($: CheerioAPI) {
  return $("title").first().text().trim();
}

/** @internal */
function extractMeta($: CheerioAPI) {
  const meta: Record<string, string> = {};

  $("meta").each((_, el) => {
    const attrs = el.attribs ?? {};
    const key = attrs.property || attrs.name || attrs["http-equiv"];
    const content = attrs.content;
    if (!key || !content) return;
    if (!meta[key]) meta[key] = content;
  });

  return meta;
}

/** @internal */
function extractFavicon($: CheerioAPI) {
  return (
    $("link[rel~='icon']").attr("href") ||
    $("link[rel~='shortcut']").attr("href") ||
    $("link[rel~='apple-touch-icon']").attr("href") ||
    ""
  );
}

/** @internal */
function resolveUrl(url: string, base: string) {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

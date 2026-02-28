import { CheerioAPI, load } from "cheerio";
import Keyv from "keyv";
import QuickLRU from "quick-lru";
import { memoize } from "../../utils/memoize.js";

export type LinkPreview = {
  title: string;
  description?: string;
  image?: string;
  favicon?: string;
};

export class LinkPreviewNotFoundError extends Error {
  readonly status: number;

  constructor(url: string, status: number) {
    super(`Link not found (${status}): ${url}`);
    this.status = status;
    this.name = "LinkPreviewNotFoundError";
  }
}

export class LinkPreviewRequestError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = "LinkPreviewRequestError";
  }
}

async function _getLinkPreview(url: string): Promise<LinkPreview> {
  const response = await fetch(url, { redirect: "follow" }).catch((error) => {
    throw new LinkPreviewRequestError(
      `Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`,
    );
  });

  if (response.status === 404 || response.status === 410) {
    throw new LinkPreviewNotFoundError(url, response.status);
  }

  if (!response.ok) {
    throw new LinkPreviewRequestError(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const html = await response.text();
  const baseUrl = response.url || url;
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
}

export const getLinkPreview = memoize(_getLinkPreview, {
  cache: new Keyv({ store: new QuickLRU({ maxSize: 500 }) }),
  hash: (url) => `link-preview:${url}`,
  ttl: 60_000,
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

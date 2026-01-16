const SITE_URL = import.meta.env.VITE_SITE_URL;

export function rewriteUrl(url: string) {
  if (SITE_URL && url.startsWith(SITE_URL)) {
    return url.slice(SITE_URL.length);
  } else {
    return url;
  }
}

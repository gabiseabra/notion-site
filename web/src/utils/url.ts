import * as env from "../env.js";

export function rewriteUrl(url: string) {
  if (env.SITE_URL && url.startsWith(env.SITE_URL)) {
    return url.slice(env.SITE_URL.length);
  } else {
    return url;
  }
}

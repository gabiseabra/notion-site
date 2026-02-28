export const TEST = false;

export const DEV = import.meta.env.DEV;

export const SSR = import.meta.env.SSR;

export const API_URL =
  import.meta.env.VITE_API_URL ?? `${SSR ? "" : window.location.origin}/api`;

export const SITE_TITLE: string =
  import.meta.env.VITE_SITE_TITLE ?? "Site Title";
export const SITE_URL: string | undefined = import.meta.env.VITE_SITE_URL;

export const IS_MAC = navigator.userAgent.match(/OS X 10/);

export const SITE_IMAGE = "/wizz.jpg";

export const SITE_FAVICON = "/gator.ico";

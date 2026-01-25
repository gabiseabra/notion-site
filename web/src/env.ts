export const DEV = import.meta.env.DEV;

export const SSR = import.meta.env.SSR;

export const API_URL =
  import.meta.env.API_URL ?? `${SSR ? "" : window.location.origin}/api`;

export const SITE_TITLE: string =
  import.meta.env.VITE_SITE_TITLE ?? "Site Title";
export const SITE_URL: string | undefined = import.meta.env.VITE_SITE_URL;

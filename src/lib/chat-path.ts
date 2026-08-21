import { routing } from "@/i18n/routing";

const LOCALE_PREFIX = new RegExp(
  `^/(${routing.locales.join("|")})(/|$)`
);

/** Strip leading `/en|/el|…` so chat suggestions key off the app path. */
export function stripLocalePrefix(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX, "/");
}

/** First segment path used for suggestion buckets (`/`, `/discover`, `/trails`, `/plan`). */
export function chatBasePath(pathname: string): string {
  const normalized = stripLocalePrefix(pathname);
  return normalized.split("/").slice(0, 2).join("/") || "/";
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cypruswinter.com";

/** Turn a path or full URL into an absolute URL. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

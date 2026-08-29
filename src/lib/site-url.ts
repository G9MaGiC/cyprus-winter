/**
 * Public web origin used when env overrides are unset.
 * Live production is currently the Vercel alias (no custom domain attached yet).
 * When cypruswinter.com DNS is live, set NEXT_PUBLIC_SITE_URL / CAPACITOR_SERVER_URL
 * (and prefer those over changing this default).
 */
export const DEFAULT_PUBLIC_ORIGIN = "https://cyprus-winter-three.vercel.app";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_PUBLIC_ORIGIN;

/** Turn a path or full URL into an absolute URL. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

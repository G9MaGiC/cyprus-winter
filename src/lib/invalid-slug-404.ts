import { LOCALES, ROUTE_ID_SETS } from "@/lib/route-ids.generated";

/**
 * Real 404s for invalid dynamic slugs (AUD-65/113).
 *
 * The dynamic root layout (cookie-based locale on unprefixed URLs) commits the
 * streaming shell before a page's notFound() can set a status, so invalid
 * slugs used to soft-404 with HTTP 200. A URL that matches NO route, however,
 * does return a genuine 404 with the styled not-found page (verified live on
 * the /he/guides class). The proxy therefore rewrites "known family + unknown
 * slug" onto such a URL before rendering starts.
 *
 * Strictly fail-open: a valid slug, an unknown path shape, or an unlisted
 * family returns null and the request proceeds untouched. The id sets live in
 * route-ids.generated.ts (dependency-free for the proxy bundle) and mirror
 * each page's generateStaticParams; route-ids.test.ts guards the sync.
 */

const FAMILY_BY_SEGMENT: Record<string, string> = {
  discover: "discover",
  trails: "trails",
  "wine-routes": "wineRoutes",
  regions: "regions",
  weather: "weather",
};

/** Returns the non-matching rewrite target for an invalid slug, else null. */
export function invalidSlugRewriteTarget(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const rest = segments.length > 0 && LOCALES.has(segments[0]) ? segments.slice(1) : segments;

  let family: string | undefined;
  let slug: string | undefined;
  if (rest.length === 2 && FAMILY_BY_SEGMENT[rest[0]]) {
    family = FAMILY_BY_SEGMENT[rest[0]];
    slug = rest[1];
  } else if (
    rest.length === 3 &&
    rest[0] === "book" &&
    (rest[1] === "winery" || rest[1] === "guide")
  ) {
    family = rest[1] === "winery" ? "bookWinery" : "bookGuide";
    slug = rest[2];
  }
  if (!family || !slug) return null;

  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // keep the raw segment; it will simply not match any known id
  }
  if (ROUTE_ID_SETS[family].has(decoded)) return null;

  return `${pathname.replace(/\/+$/, "")}/__404__`;
}

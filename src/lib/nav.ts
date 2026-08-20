import { routing } from "@/i18n/routing";

/**
 * Strip locale prefix from pathname for comparison.
 * e.g. /de/discover/omodos -> /discover/omodos
 */
export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (routing.locales as readonly string[]).includes(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

/** Hub routes that live under Discover in the IA (not separate primary-nav items). */
export const DISCOVER_HUB_PATHS = [
  "/beaches",
  "/villages",
  "/wineries",
  "/cycling",
  "/wine-routes",
] as const;

function pathMatchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/**
 * Shared nav helpers used by Nav and BottomNav.
 * Locale-aware: works for both /discover and /de/discover.
 */
export function isActive(pathname: string, href: string): boolean {
  const path = getPathWithoutLocale(pathname);
  if (href === "/") return path === "/" || path === "";
  // Treat booking flow routes as part of Bookings for nav highlighting.
  if (href === "/bookings" && pathMatchesPrefix(path, "/book")) return true;
  // Discover hubs (beaches, villages, …) highlight Discover, not a missing nav item.
  if (href === "/discover" && DISCOVER_HUB_PATHS.some((hub) => pathMatchesPrefix(path, hub))) {
    return true;
  }
  return path === href || path.startsWith(`${href}/`);
}

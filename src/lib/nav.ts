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

/**
 * Shared nav helpers used by Nav and BottomNav.
 * Locale-aware: works for both /discover and /de/discover.
 */
export function isActive(pathname: string, href: string): boolean {
  const path = getPathWithoutLocale(pathname);
  if (href === "/") return path === "/" || path === "";
  // Treat booking flow routes as part of Bookings for nav highlighting.
  if (href === "/bookings" && (path === "/book" || path.startsWith("/book/")))
    return true;
  return path === href || path.startsWith(href + "/");
}

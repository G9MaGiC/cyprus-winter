/**
 * Shared nav helpers used by Nav and BottomNav.
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  // Treat booking flow routes as part of Bookings for nav highlighting.
  if (href === "/bookings" && (pathname === "/book" || pathname.startsWith("/book/"))) return true;
  return pathname === href || pathname.startsWith(href + "/");
}

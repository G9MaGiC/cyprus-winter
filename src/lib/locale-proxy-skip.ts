/** Paths that must not receive a locale prefix rewrite (API-like app routes). */
export function shouldSkipLocaleProxy(pathname: string): boolean {
  return pathname === "/manifests" || pathname.startsWith("/manifests/");
}

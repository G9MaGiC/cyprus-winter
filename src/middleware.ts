import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: i18n locale routing + lightweight auth gate for protected routes.
 *
 * Auth approach: The client sets a `cw-auth` cookie when a Supabase session
 * exists (see AuthContext). This cookie carries no secrets — it's a hint that
 * lets middleware redirect unauthenticated visitors to /account (sign-in page)
 * before serving protected server-rendered content. True auth verification
 * still happens client-side via Supabase session tokens in localStorage.
 *
 * To fully verify sessions server-side, migrate to @supabase/ssr with
 * cookie-based session storage.
 */

const PROTECTED_PREFIXES = ["/account/settings"];

function isProtectedRoute(pathname: string): boolean {
  // Strip locale prefix if present (e.g. /de/account/settings → /account/settings)
  const stripped = pathname.replace(/^\/(en|el|de|pl)(?=\/|$)/, "") || "/";
  return PROTECTED_PREFIXES.some((prefix) => stripped.startsWith(prefix));
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth gate: redirect unauthenticated users away from protected routes
  if (isProtectedRoute(pathname)) {
    const hasAuth = req.cookies.get("cw-auth")?.value === "1";
    if (!hasAuth) {
      const url = req.nextUrl.clone();
      // Redirect to /account (sign-in page) preserving locale
      const localeMatch = pathname.match(/^\/(en|el|de|pl)\//);
      url.pathname = localeMatch ? `/${localeMatch[1]}/account` : "/account";
      return NextResponse.redirect(url);
    }
  }

  // i18n locale routing
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all pathnames except static assets and internal Next.js paths
    "/((?!_next|api|.*\\..*).*)",
  ],
};

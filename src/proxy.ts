import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { shouldSkipLocaleProxy } from "@/lib/locale-proxy-skip";

const intlMiddleware = createIntlMiddleware(routing);

// Chain next-intl (locale routing) with security headers
export default function proxy(request: NextRequest): NextResponse {
  // PWA manifests live at /manifests/[locale]. Locale middleware otherwise
  // rewrites /manifests/en → /en/manifests/en (404), breaking install + SW precache.
  const pathname = request.nextUrl?.pathname ?? "";
  const response = shouldSkipLocaleProxy(pathname)
    ? NextResponse.next()
    : intlMiddleware(request);

  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  const cspHeader = [
    "default-src 'self'",
    scriptSrc,
    // Allow styles from self and unsafe-inline (required for Tailwind)
    "style-src 'self' 'unsafe-inline'",
    // Images from self, blob, data, and external sources
    "img-src 'self' blob: data: https://images.unsplash.com https://cdn.shopify.com https://*.tile.openstreetmap.org",
    // Fonts from self
    "font-src 'self' https://fonts.gstatic.com",
    // Connect to self and external APIs
    "connect-src 'self' https://api.moonshot.ai https://*.supabase.co",
    // OpenStreetMap detail-page embeds (Leaflet tiles + OSM iframe)
    "frame-src 'self' https://www.openstreetmap.org",
    // No nested framing of this app
    "frame-ancestors 'none'",
    // Forms can only submit to self
    "form-action 'self'",
    // Base URI restriction
    "base-uri 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self'",
    // Upgrade HTTP to HTTPS
    "upgrade-insecure-requests",
  ].join("; ");

  // Add security headers
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  return response;
}

// Configure proxy to run on all routes except static files
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { shouldSkipLocaleProxy } from "@/lib/locale-proxy-skip";

const intlMiddleware = createIntlMiddleware(routing);

function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

// Chain next-intl (locale routing) with security headers
export default function proxy(request: NextRequest): NextResponse {
  const isDev = process.env.NODE_ENV === "development";
  // Per-request nonce lets production drop 'unsafe-inline' from script-src.
  // Next reads the CSP from the *request* headers and stamps the nonce onto
  // every script tag it emits; 'strict-dynamic' then trusts what those
  // scripts load. Dev keeps unsafe-inline/eval — Fast Refresh needs them.
  const nonce = generateNonce();
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

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
    // api.moonshot.ai is intentionally absent: the browser never connects to it
    // (AI providers are called server-side from /api/chat).
    "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.sentry.io",
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

  // PWA manifests live at /manifests/[locale]. Locale middleware otherwise
  // rewrites /manifests/en → /en/manifests/en (404), breaking install + SW precache.
  const pathname = request.nextUrl?.pathname ?? "";
  if (!isDev) {
    // Next reads the CSP from the REQUEST headers and stamps the nonce onto
    // every script tag it renders — so this must be set before the response
    // (intl rewrite or pass-through) is created from this request.
    request.headers.set("content-security-policy", cspHeader);
    request.headers.set("x-nonce", nonce);
  }
  const response = shouldSkipLocaleProxy(pathname)
    ? NextResponse.next({ request: { headers: request.headers } })
    : intlMiddleware(request);

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

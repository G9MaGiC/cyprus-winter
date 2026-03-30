import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Chain next-intl (locale routing) with security headers
export default function proxy(request: NextRequest): NextResponse {
  const response = intlMiddleware(request);

  // Build CSP header — broad script-src keeps Turbopack/dev tooling happy; tighten with nonces/hashes for prod if required.
  const cspHeader = [
    "default-src 'self'",
    // Allow scripts from self, nonce, strict-dynamic for Next.js, and unsafe-inline as fallback
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    // Allow styles from self and unsafe-inline (required for Tailwind)
    "style-src 'self' 'unsafe-inline'",
    // Images from self, blob, data, and external sources
    "img-src 'self' blob: data: https://images.unsplash.com https://cdn.shopify.com",
    // Fonts from self
    "font-src 'self' https://fonts.gstatic.com",
    // Connect to self and external APIs
    "connect-src 'self' https://api.moonshot.ai https://*.supabase.co",
    // No frames allowed
    "frame-ancestors 'none'",
    // Forms can only submit to self
    "form-action 'self'",
    // Base URI restriction
    "base-uri 'self'",
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

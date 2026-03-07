import { NextRequest, NextResponse } from "next/server";

// Simple nonce generator for CSP
function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

// Security headers proxy handler
export default function proxy(request: NextRequest): NextResponse {
  const nonce = generateNonce();
  
  // Build CSP header
  const cspHeader = [
    "default-src 'self'",
    // Allow scripts from self, nonce, strict-dynamic for Next.js, and unsafe-inline as fallback
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    // Allow styles from self and unsafe-inline (required for Tailwind)
    "style-src 'self' 'unsafe-inline'",
    // Images from self, blob, data, and external sources
    "img-src 'self' blob: data: https://images.unsplash.com https://cdn.shopify.com",
    // Fonts from self
    "font-src 'self'",
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

  // Create response with security headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icon-*.png (PWA icons)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)",
  ],
};

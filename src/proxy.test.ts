import { describe, expect, it, vi } from "vitest";
import proxy from "./proxy";

const intlHandler = vi.fn(() => ({ headers: new Headers() }));

vi.mock("next-intl/middleware", () => ({
  default: () => () => intlHandler(),
}));

function mockRequest(pathname = "/"): Parameters<typeof proxy>[0] {
  return { nextUrl: { pathname } } as Parameters<typeof proxy>[0];
}

describe("proxy content security policy", () => {
  it("allows the OpenStreetMap frames and tiles used by map surfaces", () => {
    intlHandler.mockClear();
    const response = proxy(mockRequest("/discover"));
    const policy = response.headers.get("Content-Security-Policy");

    expect(intlHandler).toHaveBeenCalled();
    expect(policy?.split("; ")).toEqual(
      expect.arrayContaining([
        "img-src 'self' blob: data: https://images.unsplash.com https://cdn.shopify.com https://*.tile.openstreetmap.org",
        "frame-src 'self' https://www.openstreetmap.org",
        "frame-ancestors 'none'",
        "connect-src 'self' https://api.moonshot.ai https://*.supabase.co https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.sentry.io",
      ])
    );
  });

  it("skips locale middleware for PWA manifest routes", () => {
    intlHandler.mockClear();
    const response = proxy(mockRequest("/manifests/en"));
    expect(intlHandler).not.toHaveBeenCalled();
    expect(response.headers.get("Content-Security-Policy")).toContain("manifest-src 'self'");
  });
});

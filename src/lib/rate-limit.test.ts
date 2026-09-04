import { afterEach, describe, it, expect, vi } from "vitest";
import {
  MEMORY_FALLBACK_SCOPES,
  rateLimit,
  rateLimitHeaders,
} from "./rate-limit";

describe("rateLimitHeaders", () => {
  it("sets X-RateLimit-Remaining and Retry-After", () => {
    const resetAt = Date.now() + 45 * 1000;
    const headers = rateLimitHeaders(3, resetAt);
    expect(headers["X-RateLimit-Remaining"]).toBe("3");
    expect(headers["Retry-After"]).toBeTruthy();
  });

  it("adds X-RateLimit-Bypassed when bypassed is true", () => {
    const headers = rateLimitHeaders(999999, Date.now() + 60, true);
    expect(headers["X-RateLimit-Bypassed"]).toBe("true");
  });

  it("Retry-After is at least 1 when resetAt is in past", () => {
    const headers = rateLimitHeaders(0, Date.now() - 1000);
    expect(parseInt(headers["Retry-After"] as string, 10)).toBeGreaterThanOrEqual(1);
  });

  it("clamps remaining to 0 when negative", () => {
    const headers = rateLimitHeaders(-1, Date.now() + 60);
    expect(headers["X-RateLimit-Remaining"]).toBe("0");
  });
});

describe("rateLimit production soft-degrade (BUG-354)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function req(ip = "203.0.113.10") {
    return new Request("http://localhost/api/weather", {
      headers: { "x-vercel-forwarded-for": ip },
    });
  }

  it("allows weather/right-now without Upstash in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");
    vi.stubEnv("E2E_TEST_MODE", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    for (const scope of ["weather", "right-now", "vapid", "health"] as const) {
      expect(MEMORY_FALLBACK_SCOPES.has(scope)).toBe(true);
      const result = await rateLimit(req(), 30, scope);
      expect(result.ok).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    }
  });

  it("still fails closed for bookings/chat/track without Upstash in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");
    vi.stubEnv("E2E_TEST_MODE", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    await expect(rateLimit(req(), 10, "bookings")).rejects.toThrow(
      /Distributed rate limiting/
    );
    await expect(rateLimit(req(), 10, "chat")).rejects.toThrow(
      /Distributed rate limiting/
    );
    await expect(rateLimit(req(), 10, "trail-reports")).rejects.toThrow(
      /Distributed rate limiting/
    );
    await expect(rateLimit(req(), 120, "track")).rejects.toThrow(
      /Distributed rate limiting/
    );
  });
});

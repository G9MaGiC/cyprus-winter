import { describe, it, expect } from "vitest";
import { rateLimitHeaders } from "./rate-limit";

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

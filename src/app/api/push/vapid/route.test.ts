import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRateLimit = vi.fn();
const mockIsPushConfigured = vi.fn();
const mockGetVapidPublicKey = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("@/lib/push", () => ({
  isPushConfigured: () => mockIsPushConfigured(),
  getVapidPublicKey: () => mockGetVapidPublicKey(),
}));

import { GET } from "./route";

function req() {
  return new Request("http://localhost:3000/api/push/vapid", {
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
}

describe("GET /api/push/vapid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      ok: true,
      remaining: 9,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });
    mockIsPushConfigured.mockReturnValue(true);
    mockGetVapidPublicKey.mockReturnValue("BN-test-vapid-public-key-abc123");
  });

  it("returns 200 with publicKey when configured", async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.publicKey).toBe("BN-test-vapid-public-key-abc123");
  });

  it("includes rate limit headers", async () => {
    const res = await GET(req());
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("returns 503 when push is not configured", async () => {
    mockIsPushConfigured.mockReturnValue(false);
    const res = await GET(req());
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error.message).toContain("not configured");
  });

  it("returns 503 when VAPID key is missing", async () => {
    mockGetVapidPublicKey.mockReturnValue(null);
    const res = await GET(req());
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error.message).toContain("VAPID key missing");
  });

  it("returns 429 when rate limited", async () => {
    mockRateLimit.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      bypassed: false,
    });
    const res = await GET(req());
    expect(res.status).toBe(429);
  });

  it("returns 503 when rate limiter throws", async () => {
    mockRateLimit.mockRejectedValue(new Error("redis down"));
    const res = await GET(req());
    expect(res.status).toBe(503);
  });

  it("returns 503 when isPushConfigured throws", async () => {
    mockIsPushConfigured.mockImplementation(() => {
      throw new Error("config error");
    });
    const res = await GET(req());
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error.code).toBe("SERVICE_UNAVAILABLE");
  });
});

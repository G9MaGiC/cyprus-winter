import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @upstash/ratelimit and @upstash/redis before importing
const mockLimit = vi.fn();

vi.mock("@upstash/ratelimit", () => {
  function RatelimitClass() {
    return { limit: mockLimit };
  }
  RatelimitClass.slidingWindow = vi.fn().mockReturnValue("sliding-window-config");
  return { Ratelimit: RatelimitClass };
});

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn().mockReturnValue("mock-redis-instance"),
  },
}));

import { redisRateLimit } from "./rate-limit-redis";

describe("redisRateLimit", () => {
  beforeEach(() => {
    mockLimit.mockReset();
  });

  it("returns ok when under limit", async () => {
    mockLimit.mockResolvedValue({ success: true, remaining: 5, reset: 1700000000 });
    const result = await redisRateLimit("user-1", 10);
    expect(result).toEqual({ ok: true, remaining: 5, resetAt: 1700000000 });
  });

  it("returns not ok when rate limited", async () => {
    mockLimit.mockResolvedValue({ success: false, remaining: 0, reset: 1700000060 });
    const result = await redisRateLimit("user-2", 10);
    expect(result).toEqual({ ok: false, remaining: 0, resetAt: 1700000060 });
  });

  it("passes identifier to limiter.limit", async () => {
    mockLimit.mockResolvedValue({ success: true, remaining: 9, reset: 1700000000 });
    await redisRateLimit("test-id", 10);
    expect(mockLimit).toHaveBeenCalledWith("test-id");
  });

  it("returns remaining count and reset time from limiter", async () => {
    const resetTime = Date.now() + 30000;
    mockLimit.mockResolvedValue({ success: true, remaining: 3, reset: resetTime });
    const result = await redisRateLimit("user-x", 5);
    expect(result.remaining).toBe(3);
    expect(result.resetAt).toBe(resetTime);
  });
});

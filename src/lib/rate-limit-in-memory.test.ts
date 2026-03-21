import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./rate-limit-shared", async () => {
  const actual = await vi.importActual<typeof import("./rate-limit-shared")>("./rate-limit-shared");
  return {
    ...actual,
    shouldBypass: vi.fn(() => false),
  };
});

import { inMemoryRateLimit } from "./rate-limit-in-memory";
import { shouldBypass } from "./rate-limit-shared";

const mockShouldBypass = vi.mocked(shouldBypass);

function makeReq(): Request {
  return new Request("https://example.com");
}

describe("inMemoryRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T12:00:00Z"));
    mockShouldBypass.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request and reports remaining", () => {
    const result = inMemoryRateLimit("user-1", 5, makeReq());
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i++) {
      const result = inMemoryRateLimit("user-2", 5, makeReq());
      expect(result.ok).toBe(true);
    }
  });

  it("blocks requests over the limit", () => {
    for (let i = 0; i < 5; i++) {
      inMemoryRateLimit("user-3", 5, makeReq());
    }
    const result = inMemoryRateLimit("user-3", 5, makeReq());
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 5; i++) {
      inMemoryRateLimit("user-4", 5, makeReq());
    }
    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);
    const result = inMemoryRateLimit("user-4", 5, makeReq());
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("returns bypass result when shouldBypass returns true", () => {
    mockShouldBypass.mockReturnValue(true);
    const result = inMemoryRateLimit("user-5", 1, makeReq());
    expect(result.ok).toBe(true);
    expect(result.bypassed).toBe(true);
    expect(result.remaining).toBe(999999);
  });

  it("tracks different identifiers independently", () => {
    for (let i = 0; i < 5; i++) {
      inMemoryRateLimit("user-A", 5, makeReq());
    }
    const resultA = inMemoryRateLimit("user-A", 5, makeReq());
    expect(resultA.ok).toBe(false);

    const resultB = inMemoryRateLimit("user-B", 5, makeReq());
    expect(resultB.ok).toBe(true);
  });

  it("provides a future resetAt timestamp", () => {
    const result = inMemoryRateLimit("user-6", 5, makeReq());
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});

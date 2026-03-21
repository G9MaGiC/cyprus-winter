import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("rate-limit-shared", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.STRESS_TEST_TOKEN;
    delete process.env.NODE_ENV;
  });

  describe("getClientId", () => {
    it("extracts IP from x-forwarded-for", async () => {
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      expect(mod.getClientId(req)).toBe("1.2.3.4");
    });

    it("falls back to x-real-ip", async () => {
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com", {
        headers: { "x-real-ip": "10.0.0.1" },
      });
      expect(mod.getClientId(req)).toBe("10.0.0.1");
    });

    it("returns 'unknown' when no IP headers present", async () => {
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com");
      expect(mod.getClientId(req)).toBe("unknown");
    });
  });

  describe("shouldBypass", () => {
    it("returns false in production", async () => {
      process.env.NODE_ENV = "production";
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com", {
        headers: { "x-stress-test": "bypass" },
      });
      expect(mod.shouldBypass(req)).toBe(false);
    });

    it("returns true in development with 'bypass' header", async () => {
      process.env.NODE_ENV = "development";
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com", {
        headers: { "x-stress-test": "bypass" },
      });
      expect(mod.shouldBypass(req)).toBe(true);
    });

    it("returns true when stress test token matches", async () => {
      process.env.NODE_ENV = "test";
      process.env.STRESS_TEST_TOKEN = "secret-token";
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com", {
        headers: { "x-stress-test": "secret-token" },
      });
      expect(mod.shouldBypass(req)).toBe(true);
    });

    it("returns false when token does not match", async () => {
      process.env.NODE_ENV = "test";
      process.env.STRESS_TEST_TOKEN = "secret-token";
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com", {
        headers: { "x-stress-test": "wrong-token" },
      });
      expect(mod.shouldBypass(req)).toBe(false);
    });

    it("returns false when no bypass header", async () => {
      process.env.NODE_ENV = "development";
      const mod = await import("./rate-limit-shared");
      const req = new Request("https://example.com");
      expect(mod.shouldBypass(req)).toBe(false);
    });
  });

  describe("bypassResult", () => {
    it("returns ok with high remaining count and bypassed flag", async () => {
      const mod = await import("./rate-limit-shared");
      const result = mod.bypassResult();
      expect(result.ok).toBe(true);
      expect(result.remaining).toBe(999999);
      expect(result.bypassed).toBe(true);
      expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe("RATE_LIMIT_WINDOW_MS", () => {
    it("is 60 seconds", async () => {
      const mod = await import("./rate-limit-shared");
      expect(mod.RATE_LIMIT_WINDOW_MS).toBe(60000);
    });
  });
});

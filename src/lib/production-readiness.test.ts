import { describe, expect, it, vi } from "vitest";
import { getProductionEnvChecks, productionEnvReady } from "@/lib/production-readiness";

describe("production-readiness", () => {
  it("returns no checks outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(getProductionEnvChecks()).toEqual([]);
    expect(productionEnvReady()).toBe(true);
    vi.unstubAllEnvs();
  });

  it("requires Upstash when NODE_ENV is production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const checks = getProductionEnvChecks();
    expect(checks.find((c) => c.id === "upstash")?.ok).toBe(false);
    expect(productionEnvReady()).toBe(false);
    vi.unstubAllEnvs();
  });
});

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

  it("treats booking lookup tokens as optional in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    vi.stubEnv("BOOKING_LOOKUP_TOKEN_SECRET", "");

    const checks = getProductionEnvChecks();
    const lookup = checks.find((c) => c.id === "booking-lookup-token");
    expect(lookup?.required).toBe(false);
    expect(lookup?.ok).toBe(false);
    expect(productionEnvReady()).toBe(true);

    vi.stubEnv("BOOKING_LOOKUP_TOKEN_SECRET", "booking-lookup-secret-for-tests");
    expect(getProductionEnvChecks().find((c) => c.id === "booking-lookup-token")?.ok).toBe(true);
    vi.unstubAllEnvs();
  });
});

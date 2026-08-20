import { afterEach, describe, it, expect, vi } from "vitest";
import { GET } from "./route";

function req(url = "http://localhost:3000/api/health", headers: Record<string, string> = {}) {
  return new Request(url, { headers: { "x-forwarded-for": "127.0.0.1", ...headers } });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/health", () => {
  it("returns 200 with ok, ai, storage, email, resend fields", async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("ok");
    expect(data).toHaveProperty("ai");
    expect(data).toHaveProperty("storage");
    expect(data).toHaveProperty("email");
    expect(data).toHaveProperty("resend");
    expect(["ok", "error", "not configured"]).toContain(data.resend);
    expect(typeof data.ok).toBe("boolean");
    expect(data).toHaveProperty("productionReady");
  });

  it("includes rate limit headers", async () => {
    const res = await GET(req());
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("exposes productionReady on public production health without leaking checks", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("HEALTH_SECRET", "annex-health-secret-16");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const res = await GET(req());
    const data = (await res.json()) as Record<string, unknown>;
    const body = JSON.stringify(data);

    expect(res.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(typeof data.productionReady).toBe("boolean");
    expect(data.productionReady).toBe(false);
    expect(data).not.toHaveProperty("productionChecks");
    expect(body).not.toContain("annex-health-secret-16");
    expect(body).not.toContain("UPSTASH_REDIS_REST_TOKEN");
  });

  it("returns annex productionChecks only with the health bearer token", async () => {
    const secret = "annex-health-secret-16";
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("HEALTH_SECRET", secret);
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const denied = await GET(req("http://localhost:3000/api/health", { authorization: "Bearer wrong" }));
    const deniedBody = (await denied.json()) as Record<string, unknown>;
    expect(deniedBody).not.toHaveProperty("productionChecks");

    const res = await GET(req("http://localhost:3000/api/health", { authorization: `Bearer ${secret}` }));
    const data = (await res.json()) as {
      productionReady: boolean;
      productionChecks: Array<{ id: string; ok: boolean; required: boolean; hint?: string }>;
    };
    const body = JSON.stringify(data);

    expect(res.status).toBe(503);
    expect(data.productionReady).toBe(false);
    expect(data.productionChecks.map((c) => c.id)).toEqual(
      expect.arrayContaining(["upstash", "supabase"])
    );
    expect(data.productionChecks.find((c) => c.id === "upstash")?.ok).toBe(false);
    expect(data.productionChecks.find((c) => c.id === "upstash")?.required).toBe(true);
    expect(body).not.toContain(secret);
    expect(data.productionChecks.every((c) => !("hint" in c) || c.hint === undefined)).toBe(true);
  });
});

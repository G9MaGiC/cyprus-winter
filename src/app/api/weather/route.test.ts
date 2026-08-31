import { afterEach, describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/weather-live", () => ({
  getLiveWeather: vi.fn().mockResolvedValue({
    coast: { minC: 14, maxC: 18 },
    troodos: { minC: 4, maxC: 8 },
    updatedAt: "2026-01-01T12:00:00.000Z",
  }),
  getWeatherAtCoords: vi.fn(),
}));

function getReq(url: string, ip = "127.0.0.60") {
  return new Request(url, { headers: { "x-forwarded-for": ip } });
}

describe("GET /api/weather", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns live weather", async () => {
    const res = await GET(getReq("http://localhost:3000/api/weather"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.coast).toBeDefined();
    expect(data.troodos).toBeDefined();
  });

  it("returns 400 for invalid lat/lng", async () => {
    const res = await GET(
      getReq("http://localhost:3000/api/weather?lat=999&lng=0", "127.0.0.61")
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("serves weather in production without Upstash via memory fallback (BUG-354)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");
    vi.stubEnv("E2E_TEST_MODE", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const res = await GET(getReq("http://localhost:3000/api/weather", "127.0.0.62"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.coast).toBeDefined();
  });
});

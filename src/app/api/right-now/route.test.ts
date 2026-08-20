import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/weather-live", () => ({
  getWeatherAtCoords: vi.fn().mockResolvedValue({
    coast: { minC: 16, maxC: 18 },
    troodos: { minC: 6, maxC: 10 },
    updatedAt: "2026-01-01T12:00:00.000Z",
  }),
}));

function req(url: string, ip = "127.0.0.70") {
  return new Request(url, { headers: { "x-forwarded-for": ip } });
}

describe("GET /api/right-now", () => {
  it("returns ranked items for valid coordinates", async () => {
    const res = await GET(
      req("http://localhost:3000/api/right-now?lat=34.7&lng=33.0&limit=5")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.length).toBeLessThanOrEqual(5);
  });

  it("returns 400 for missing coordinates", async () => {
    const res = await GET(req("http://localhost:3000/api/right-now", "127.0.0.71"));
    expect(res.status).toBe(400);
  });
});

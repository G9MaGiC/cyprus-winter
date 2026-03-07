import { describe, it, expect } from "vitest";
import { GET } from "./route";

function req(url = "http://localhost:3000/api/health") {
  return new Request(url, { headers: { "x-forwarded-for": "127.0.0.1" } });
}

describe("GET /api/health", () => {
  it("returns 200 with ok, ai, storage, email fields", async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("ok");
    expect(data).toHaveProperty("ai");
    expect(data).toHaveProperty("storage");
    expect(data).toHaveProperty("email");
    expect(typeof data.ok).toBe("boolean");
  });

  it("includes rate limit headers", async () => {
    const res = await GET(req());
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "./route";

describe("debug-log API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 404 in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new Request("http://localhost:3000/api/debug-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: "c3018a", message: "test" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 403 for wrong session id in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const req = new Request("http://localhost:3000/api/debug-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: "wrong", message: "test" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});

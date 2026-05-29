import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ ok: true, remaining: 9, resetAt: Date.now() + 60000, bypassed: false }),
}));

vi.mock("@/lib/push", () => ({
  isPushConfigured: vi.fn().mockReturnValue(true),
  getVapidPublicKey: vi.fn().mockReturnValue("test-vapid-public-key"),
}));

describe("push vapid API", () => {
  it("returns public key when push is configured", async () => {
    const req = new Request("http://localhost:3000/api/push/vapid", {
      headers: { "x-forwarded-for": "127.0.0.70" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.publicKey).toBe("test-vapid-public-key");
  });
});

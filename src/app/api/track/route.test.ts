import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";
import type { NextRequest } from "next/server";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({
    ok: true,
    remaining: 119,
    resetAt: new Date(Date.now() + 60_000),
    bypassed: false,
  }),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => null,
}));

function req(body: unknown) {
  return new Request("http://localhost:3000/api/track", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.9",
      "user-agent": "vitest",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/track", () => {
  it("returns 400 for disallowed event", async () => {
    const res = await POST(req({ event: "not_allowed", eventId: "8e3a1b3b-3c86-4c0f-9a6a-4ee4f6a0b4f5", sessionId: "sid_test", properties: {} }) as unknown as NextRequest);
    expect(res.status).toBe(400);
  });

  it("accepts plan_view payload", async () => {
    const res = await POST(
      req({
        event: "plan_view",
        eventId: "6d86d7c8-ff23-4a06-8d1b-42d4cf4a7b47",
        sessionId: "sid_test",
        properties: { locale: "de", item_count: 2, day_count: 1, has_content: true, source: "plan" },
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.stored).toBe(false);
    expect(data.deduped).toBe(false);
  });

  it("dedupes repeated eventId within TTL", async () => {
    const body = {
      event: "plan_view",
      eventId: "b45f1b4a-2f3b-4c3a-9e23-1ed6f4b3778b",
      sessionId: "sid_test",
      properties: { source: "test" },
    };
    const res1 = await POST(req(body) as unknown as NextRequest);
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.deduped).toBe(false);

    const res2 = await POST(req(body) as unknown as NextRequest);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.deduped).toBe(true);
    expect(data2.stored).toBe(false);
  });

  it("returns 400 for oversized properties", async () => {
    const big = "x".repeat(3000);
    const res = await POST(
      req({ event: "plan_view", eventId: "3bfeec12-8e67-4202-b381-0c06af9d7c29", sessionId: "sid_test", properties: { big } }) as unknown as NextRequest
    );
    expect(res.status).toBe(400);
  });
});


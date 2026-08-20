import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const upsert = vi.fn();
const single = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({
    ok: true,
    remaining: 4,
    resetAt: Date.now() + 60_000,
    bypassed: false,
  }),
}));

const pushMocks = vi.hoisted(() => ({
  isPushConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/push", async () => {
  const actual = await vi.importActual<typeof import("@/lib/push")>("@/lib/push");
  return {
    ...actual,
    isPushConfigured: pushMocks.isPushConfigured,
  };
});

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single,
        }),
      }),
      upsert,
    }),
  }),
}));

const validBody = {
  clientId: "client-id-12",
  subscription: {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc",
    keys: { p256dh: "p256dh-key", auth: "auth-key" },
  },
};

function postReq(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/push/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.80",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/push/subscribe", () => {
  beforeEach(() => {
    pushMocks.isPushConfigured.mockReturnValue(true);
    single.mockResolvedValue({ data: null, error: null });
    upsert.mockResolvedValue({ error: null });
  });

  it("returns 503 when push is not configured", async () => {
    pushMocks.isPushConfigured.mockReturnValue(false);
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(503);
    expect((await res.json()).error?.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(postReq({ clientId: "short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for unsupported push endpoint", async () => {
    const res = await POST(
      postReq({
        ...validBody,
        subscription: {
          ...validBody.subscription,
          endpoint: "https://evil.example/push",
        },
      })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns 413 for oversized payloads", async () => {
    const res = await POST(postReq(validBody, { "content-length": "32001" }));
    expect(res.status).toBe(413);
    expect((await res.json()).error?.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns 200 and upserts a valid subscription", async () => {
    const res = await POST(postReq(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("4");
    expect(upsert).toHaveBeenCalled();
  });
});

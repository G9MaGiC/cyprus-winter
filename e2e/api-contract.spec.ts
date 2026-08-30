import { test, expect } from "@playwright/test";

/**
 * API contract pins — environment-independent behaviors the launch-readiness
 * audit relies on, asserted against the real running server (no page.route
 * mocks). CI and local E2E both run `next start` with no Supabase/Redis, so
 * the fail-closed contract is exactly what production shows until env vars
 * land (BUG-269): booking storage 503s rather than silently degrading.
 */

test.describe("API contract — booking engine fail-closed + validation", () => {
  test("booking storage gates fail closed with the uniform error envelope", async ({ request }) => {
    const post = await request.post("/api/bookings", {
      data: {
        type: "winery_tasting",
        providerId: "tsiakkas",
        date: "2026-12-05",
        partySize: 2,
        guestEmail: "contract@example.com",
        guestName: "Contract Test",
        idempotencyKey: crypto.randomUUID(),
      },
    });
    expect(post.status()).toBe(503);
    const body = await post.json();
    expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(typeof body.error.message).toBe("string");
    expect(body.message).toBe(body.error.message);

    const get = await request.get("/api/bookings?email=contract%40example.com");
    expect(get.status()).toBe(503);
    expect((await get.json()).error.code).toBe("SERVICE_UNAVAILABLE");
  });

  test("malformed input is rejected before any storage gate", async ({ request }) => {
    // Buffer keeps the bytes raw — the request fixture JSON-stringifies plain
    // strings under a JSON content-type, which would make them valid JSON.
    const badJson = await request.post("/api/bookings", {
      headers: { "content-type": "application/json" },
      data: Buffer.from("{not json"),
    });
    expect(badJson.status()).toBe(400);
    expect((await badJson.json()).error.code).toBe("VALIDATION_ERROR");

    const oversized = await request.post("/api/bookings", {
      headers: { "content-type": "application/json" },
      data: JSON.stringify({ notes: "x".repeat(40_000) }),
    });
    expect(oversized.status()).toBe(413);
    expect((await oversized.json()).error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  test("debug endpoint is dead in production builds", async ({ request }) => {
    const res = await request.post("/api/debug-log", {
      data: { sessionId: "c3018a", message: "should not land" },
    });
    expect(res.status()).toBe(404);
  });

  test("partner booking mutations demand a session", async ({ request }) => {
    const res = await request.patch("/api/partner/bookings/some-id", {
      data: { status: "confirmed" },
    });
    // 401 without a partner session cookie; 503 only if the portal secret
    // is unset AND rate limiting is unavailable — never a silent success.
    expect([401, 503]).toContain(res.status());
    const body = await res.json();
    expect(["UNAUTHORIZED", "SERVICE_UNAVAILABLE"]).toContain(body.error.code);
  });

  test("cron endpoints reject unauthenticated callers", async ({ request }) => {
    for (const path of ["/api/cron/daily", "/api/cron/weather-digest"]) {
      const res = await request.get(path);
      expect([401, 405]).toContain(res.status());
    }
  });
});

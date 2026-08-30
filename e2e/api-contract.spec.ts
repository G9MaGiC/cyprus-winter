import { test, expect } from "@playwright/test";

/**
 * API contract pins — environment-independent behaviors the launch-readiness
 * audit relies on, asserted against the real running server (no page.route
 * mocks). CI and local E2E both run `next start` with no Supabase/Redis, so
 * the fail-closed contract is exactly what production shows until env vars
 * land (BUG-269): booking storage 503s rather than silently degrading.
 */

test.describe("API contract — booking engine contracts + validation", () => {
  test("real submit contract under the CI E2E memory store: create, replay, conflict, honeypot, lookup", async ({ request }) => {
    // Gate scripts run the server with CI+E2E_TEST_MODE, so this exercises
    // the genuine createBooking path (in-memory). Real production keeps the
    // fail-closed 503 — pinned in route-fail-closed.test.ts.
    const idempotencyKey = crypto.randomUUID();
    const email = `contract-${Date.now()}@example.com`;
    const payload = {
      type: "winery_tasting",
      providerId: "tsiakkas",
      date: "2026-12-05",
      partySize: 2,
      guestEmail: email,
      guestName: "Contract Test",
      idempotencyKey,
    };

    const created = await request.post("/api/bookings", { data: payload });
    expect(created.status()).toBe(200);
    const createdBody = await created.json();
    expect(createdBody.storage).toBe("memory");
    expect(createdBody.booking.status).toBe("pending");

    const replayed = await request.post("/api/bookings", { data: payload });
    expect(replayed.status()).toBe(200);
    const replayedBody = await replayed.json();
    expect(replayedBody.replayed).toBe(true);
    expect(replayedBody.booking.id).toBe(createdBody.booking.id);

    const conflict = await request.post("/api/bookings", {
      data: { ...payload, partySize: 4 },
    });
    expect(conflict.status()).toBe(409);
    expect((await conflict.json()).error.code).toBe("IDEMPOTENCY_CONFLICT");

    const honeypot = await request.post("/api/bookings", {
      data: { ...payload, idempotencyKey: crypto.randomUUID(), website: "spam.example" },
    });
    expect(honeypot.status()).toBe(200);
    expect((await honeypot.json()).stored).toBe(false);

    const lookup = await request.get(`/api/bookings?email=${encodeURIComponent(email)}`);
    expect(lookup.status()).toBe(200);
    const bookings = (await lookup.json()).bookings as { id: string }[];
    expect(bookings.some((b) => b.id === createdBody.booking.id)).toBe(true);
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

import { afterEach, describe, expect, it, vi } from "vitest";
import { POST, GET } from "./route";

/**
 * Production fail-closed contract for the booking engine (moved here from
 * E2E when CI E2E gained the in-memory allowance): with no Redis and no
 * Supabase configured, real production deployments must 503, never accept
 * a booking they could lose. The CI-only double flag (CI + E2E_TEST_MODE)
 * is the sole bypass — src/lib/test-mode.ts documents the contract.
 */

function bookingRequest(): Request {
  return new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "winery_tasting",
      providerId: "tsiakkas",
      date: "2026-12-05",
      partySize: 2,
      guestEmail: "failclosed@example.com",
      guestName: "Fail Closed",
      idempotencyKey: crypto.randomUUID(),
    }),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("booking engine fails closed in real production", () => {
  it("POST returns 503 SERVICE_UNAVAILABLE without Redis/Supabase and without the CI E2E flags", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");
    vi.stubEnv("E2E_TEST_MODE", "");
    const res = await POST(bookingRequest());
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("GET returns 503 without Redis/Supabase and without the CI E2E flags", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");
    vi.stubEnv("E2E_TEST_MODE", "");
    const res = await GET(new Request("http://localhost/api/bookings?email=failclosed%40example.com"));
    expect(res.status).toBe(503);
  });

  it("the CI E2E double flag opens the in-memory path (rate limit + storage together)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "true");
    vi.stubEnv("E2E_TEST_MODE", "true");
    const res = await POST(bookingRequest());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { storage: string; booking: { status: string } };
    expect(body.storage).toBe("memory");
    expect(body.booking.status).toBe("pending");
  });

  it("one flag alone is not enough", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "true");
    vi.stubEnv("E2E_TEST_MODE", "");
    const res = await POST(bookingRequest());
    expect(res.status).toBe(503);
  });
});

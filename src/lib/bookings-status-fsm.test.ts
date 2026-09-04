import { describe, expect, it } from "vitest";
import { createBooking, updateBookingStatus } from "./bookings";

/**
 * Booking status FSM (in-memory path — same guard code as Supabase path):
 *   pending -> confirmed | cancelled; confirmed -> cancelled; cancelled terminal.
 * Same-status updates replay idempotently; cross-provider updates are forbidden.
 */

async function seedBooking() {
  const { booking } = await createBooking({
    type: "winery_tasting",
    providerId: "tsiakkas",
    providerName: "Tsiakkas Winery",
    date: "2026-12-05",
    partySize: 2,
    guestEmail: `fsm-${Math.random().toString(36).slice(2)}@example.com`,
    guestName: "FSM Test",
    idempotencyKey: crypto.randomUUID(),
  });
  return booking;
}

describe("booking status transitions", () => {
  it("allows pending -> confirmed and confirmed -> cancelled", async () => {
    const b = await seedBooking();
    const confirmed = await updateBookingStatus(b.id, "confirmed", "tsiakkas");
    expect("booking" in confirmed && confirmed.booking.status).toBe("confirmed");
    const cancelled = await updateBookingStatus(b.id, "cancelled", "tsiakkas");
    expect("booking" in cancelled && cancelled.booking.status).toBe("cancelled");
  });

  it("allows pending -> cancelled", async () => {
    const b = await seedBooking();
    const res = await updateBookingStatus(b.id, "cancelled", "tsiakkas");
    expect("booking" in res && res.booking.status).toBe("cancelled");
  });

  it("treats same-status updates as idempotent no-ops", async () => {
    const b = await seedBooking();
    await updateBookingStatus(b.id, "confirmed", "tsiakkas");
    const again = await updateBookingStatus(b.id, "confirmed", "tsiakkas");
    expect("booking" in again && again.booking.status).toBe("confirmed");
  });

  it("flags real transitions vs no-op retries so callers can gate side effects (AUD-08)", async () => {
    const b = await seedBooking();
    const first = await updateBookingStatus(b.id, "confirmed", "tsiakkas");
    expect("changed" in first && first.changed).toBe(true);
    // The retry must not re-send the guest status email.
    const retry = await updateBookingStatus(b.id, "confirmed", "tsiakkas");
    expect("changed" in retry && retry.changed).toBe(false);
  });

  it("rejects reviving a cancelled booking", async () => {
    const b = await seedBooking();
    await updateBookingStatus(b.id, "cancelled", "tsiakkas");
    const revived = await updateBookingStatus(b.id, "confirmed", "tsiakkas");
    expect("error" in revived && revived.error).toBe("invalid_transition");
  });

  it("forbids updates from a different provider", async () => {
    const b = await seedBooking();
    const res = await updateBookingStatus(b.id, "confirmed", "another-winery");
    expect("error" in res && res.error).toBe("forbidden");
  });

  it("returns not_found for unknown ids and disallowed target statuses", async () => {
    const missing = await updateBookingStatus("nope", "confirmed", "tsiakkas");
    expect("error" in missing && missing.error).toBe("not_found");
    const b = await seedBooking();
    const bad = await updateBookingStatus(b.id, "pending", "tsiakkas");
    expect("error" in bad && bad.error).toBe("not_found");
  });
});

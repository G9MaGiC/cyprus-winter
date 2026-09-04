import { describe, it, expect, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST as CANCEL } from "./[id]/cancel/route";
import { createBooking } from "@/lib/bookings";
import { sendGuestCancellationEmail } from "@/lib/email";

vi.mock("@/lib/email", () => ({
  sendGuestCancellationEmail: vi.fn().mockResolvedValue(true),
  sendCancellationNoticeToPartner: vi.fn().mockResolvedValue(true),
}));

function cancelReq(id: string, body: unknown, ip: string) {
  const req = new Request(`http://localhost:3000/api/bookings/${id}/cancel`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
  return CANCEL(req, { params: Promise.resolve({ id }) });
}

async function makeBooking(key: string, email = "cancel-guest@example.com") {
  const { booking } = await createBooking({
    type: "winery_tasting",
    providerId: "tsiakkas",
    providerName: "Tsiakkas",
    date: "2099-03-20",
    partySize: 2,
    guestEmail: email,
    guestName: "Cancel Guest",
    idempotencyKey: key,
    locale: "de",
  });
  return booking;
}

describe("POST /api/bookings/[id]/cancel", () => {
  it("cancels the guest's own booking and sends the localized confirmation", async () => {
    const booking = await makeBooking("cancel-key-001");
    const res = await cancelReq(booking.id, { guestEmail: booking.guestEmail }, "127.0.0.71");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.booking.status).toBe("cancelled");
    expect(data.changed).toBe(true);
    // migration-008 payoff: the email goes out in the guest's stored locale
    expect(vi.mocked(sendGuestCancellationEmail)).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: booking.id, status: "cancelled" }),
      "de"
    );
  });

  it("answers 404 for a wrong email, indistinguishable from a missing booking", async () => {
    const booking = await makeBooking("cancel-key-002");
    const wrongEmail = await cancelReq(
      booking.id,
      { guestEmail: "someone-else@example.com" },
      "127.0.0.72"
    );
    const missing = await cancelReq(
      "not-a-real-booking-id",
      { guestEmail: booking.guestEmail },
      "127.0.0.73"
    );
    expect(wrongEmail.status).toBe(404);
    expect(missing.status).toBe(404);
    const a = await wrongEmail.json();
    const b = await missing.json();
    expect(a.error?.code).toBe(b.error?.code);
  });

  it("is idempotent: a second cancel is a 200 no-op and re-sends no email", async () => {
    const booking = await makeBooking("cancel-key-003");
    const first = await cancelReq(booking.id, { guestEmail: booking.guestEmail }, "127.0.0.74");
    expect(first.status).toBe(200);
    const sendsAfterFirst = vi.mocked(sendGuestCancellationEmail).mock.calls.length;
    const second = await cancelReq(booking.id, { guestEmail: booking.guestEmail }, "127.0.0.75");
    expect(second.status).toBe(200);
    const data = await second.json();
    expect(data.changed).toBe(false);
    expect(vi.mocked(sendGuestCancellationEmail).mock.calls.length).toBe(sendsAfterFirst);
  });

  it("matches the guest email case-insensitively (bookings store it normalized)", async () => {
    const booking = await makeBooking("cancel-key-004", "case-guest@example.com");
    const res = await cancelReq(booking.id, { guestEmail: "Case-Guest@Example.COM" }, "127.0.0.76");
    expect(res.status).toBe(200);
  });

  it("rejects an invalid body", async () => {
    const booking = await makeBooking("cancel-key-005");
    const res = await cancelReq(booking.id, { guestEmail: "not-an-email" }, "127.0.0.77");
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });
});

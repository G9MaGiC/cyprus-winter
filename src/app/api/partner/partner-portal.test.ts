import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST as postSession } from "@/app/api/partner/session/route";
import { GET as getBookings } from "@/app/api/partner/bookings/route";
import { PATCH as patchBookingById } from "@/app/api/partner/bookings/[id]/route";
import { PATCH as patchProfile } from "@/app/api/partner/profile/route";
import { GET as getGuestBookings, POST as postGuestBooking } from "@/app/api/bookings/route";
import { createBookingLookupToken } from "@/lib/booking-lookup-token";
import { PARTNER_SESSION_COOKIE, createPartnerSessionToken } from "@/lib/partner-session";
import { findVerifiedPartnerByEmail } from "@/lib/partner-identity";
import { resolveWineryImage } from "@/lib/cyprus-images";
import { resetPartnerOverlaysForTests } from "@/lib/partner-overlay";

const secret = "partner-portal-secret-16";
const tsiakkasEmail = "bookings+tsiakkas@cyprus-winter.example";

vi.mock("@/lib/email", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(false),
  sendBookingRequestToWinery: vi.fn().mockResolvedValue(false),
  sendBookingRequestToGuide: vi.fn().mockResolvedValue(false),
  sendBookingLookupTokenEmail: vi.fn().mockResolvedValue(true),
  sendBookingStatusEmail: vi.fn().mockResolvedValue(true),
}));

function jsonReq(url: string, method: string, body?: unknown, cookie?: string, ip = "203.0.113.10") {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": ip,
  };
  if (cookie) headers.cookie = `${PARTNER_SESSION_COOKIE}=${cookie}`;
  return new NextRequest(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("partner portal API", () => {
  beforeEach(() => {
    vi.stubEnv("PARTNER_PORTAL_SECRET", secret);
    vi.stubEnv("BOOKING_LOOKUP_TOKEN_SECRET", "booking-lookup-secret-for-tests");
    resetPartnerOverlaysForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetPartnerOverlaysForTests();
  });

  it("returns 401 for partner GETs without a session", async () => {
    const res = await getBookings(jsonReq("http://localhost:3000/api/partner/bookings", "GET"));
    expect(res.status).toBe(401);
  });

  it("rejects session login for the wrong secret or unknown email", async () => {
    const wrong = await postSession(
      jsonReq("http://localhost:3000/api/partner/session", "POST", {
        email: tsiakkasEmail,
        secret: "nope",
      })
    );
    expect(wrong.status).toBe(401);

    const unknown = await postSession(
      jsonReq("http://localhost:3000/api/partner/session", "POST", {
        email: "not-a-partner@example.com",
        secret,
      })
    );
    expect(unknown.status).toBe(401);
  });

  it("sets an HttpOnly partner cookie for a verified email", async () => {
    const res = (await postSession(
      jsonReq("http://localhost:3000/api/partner/session", "POST", {
        email: tsiakkasEmail,
        secret,
      })
    )) as NextResponse;
    expect(res.status).toBe(200);
    const cookie = res.cookies.get(PARTNER_SESSION_COOKIE);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.value).toBeTruthy();
  });

  it("lists only the signed-in provider's bookings and forbids foreign patches", async () => {
    await postGuestBooking(
      new Request("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.21" },
        body: JSON.stringify({
          type: "winery_tasting",
          providerId: "tsiakkas",
          date: "2099-04-01",
          idempotencyKey: "partner-portal-tsiakkas-001",
          partySize: 2,
          guestEmail: "guest-a@example.com",
          guestName: "Guest A",
        }),
      })
    );
    const santoRes = await postGuestBooking(
      new Request("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.22" },
        body: JSON.stringify({
          type: "winery_tasting",
          providerId: "santo",
          date: "2099-04-02",
          idempotencyKey: "partner-portal-santo-001",
          partySize: 2,
          guestEmail: "guest-b@example.com",
          guestName: "Guest B",
        }),
      })
    );
    const santoBooking = ((await santoRes.json()) as { booking: { id: string } }).booking;

    const tsiakkas = findVerifiedPartnerByEmail(tsiakkasEmail)!;
    const cookie = createPartnerSessionToken(tsiakkas, secret);

    const list = await getBookings(
      jsonReq("http://localhost:3000/api/partner/bookings", "GET", undefined, cookie, "203.0.113.23")
    );
    expect(list.status).toBe(200);
    const listed = (await list.json()) as { bookings: Array<{ providerId: string }> };
    expect(listed.bookings.every((b) => b.providerId === "tsiakkas")).toBe(true);
    expect(listed.bookings.some((b) => b.providerId === "santo")).toBe(false);

    const forbidden = await patchBookingById(
      jsonReq(
        `http://localhost:3000/api/partner/bookings/${santoBooking.id}`,
        "PATCH",
        { status: "confirmed" },
        cookie,
        "203.0.113.24"
      ),
      { params: Promise.resolve({ id: santoBooking.id }) }
    );
    expect(forbidden.status).toBe(403);
  });

  it("accepts a pending request and guests still load it via lookup token", async () => {
    const created = await postGuestBooking(
      new Request("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.25" },
        body: JSON.stringify({
          type: "winery_tasting",
          providerId: "tsiakkas",
          date: "2099-04-03",
          idempotencyKey: "partner-portal-tsiakkas-002",
          partySize: 3,
          guestEmail: "guest-c@example.com",
          guestName: "Guest C",
        }),
      })
    );
    const booking = ((await created.json()) as { booking: { id: string; status: string } }).booking;
    expect(booking.status).toBe("pending");

    const tsiakkas = findVerifiedPartnerByEmail(tsiakkasEmail)!;
    const cookie = createPartnerSessionToken(tsiakkas, secret);
    const patched = await patchBookingById(
      jsonReq(
        `http://localhost:3000/api/partner/bookings/${booking.id}`,
        "PATCH",
        { status: "confirmed" },
        cookie,
        "203.0.113.26"
      ),
      { params: Promise.resolve({ id: booking.id }) }
    );
    expect(patched.status).toBe(200);
    expect(((await patched.json()) as { booking: { status: string } }).booking.status).toBe("confirmed");

    const token = createBookingLookupToken("guest-c@example.com");
    const guest = await getGuestBookings(
      new Request(
        `http://localhost:3000/api/bookings?email=guest-c@example.com&token=${token}`,
        { headers: { "x-forwarded-for": "203.0.113.27" } }
      )
    );
    expect(guest.status).toBe(200);
    const guestBody = (await guest.json()) as { bookings: Array<{ id: string; status: string }> };
    expect(guestBody.bookings.find((b) => b.id === booking.id)?.status).toBe("confirmed");
  });

  it("stores hours and a local hero path on the partner overlay", async () => {
    const tsiakkas = findVerifiedPartnerByEmail(tsiakkasEmail)!;
    const cookie = createPartnerSessionToken(tsiakkas, secret);
    const before = resolveWineryImage("tsiakkas");
    const res = await patchProfile(
      jsonReq(
        "http://localhost:3000/api/partner/profile",
        "PATCH",
        {
          openingHours: "Winter: Tue–Sat 11:00–15:00. Call ahead.",
          imageUrl: "/images/cyprus/winery-tsiakkas.jpg",
        },
        cookie,
        "203.0.113.28"
      )
    );
    expect(res.status).toBe(200);
    expect(resolveWineryImage("tsiakkas")).toBe("/images/cyprus/winery-tsiakkas.jpg");
    expect(resolveWineryImage("tsiakkas")).not.toBe("");
    expect(before).toBeTruthy();
  });

  it("does not treat a partner cookie as guest booking auth", async () => {
    const tsiakkas = findVerifiedPartnerByEmail(tsiakkasEmail)!;
    const cookie = createPartnerSessionToken(tsiakkas, secret);
    const guest = await getGuestBookings(
      new Request("http://localhost:3000/api/bookings", {
        headers: {
          "x-forwarded-for": "203.0.113.29",
          cookie: `${PARTNER_SESSION_COOKIE}=${cookie}`,
        },
      })
    );
    expect(guest.status).toBe(400);
  });

  it("rejects an image URL that is not a local cyprus asset", async () => {
    const tsiakkas = findVerifiedPartnerByEmail(tsiakkasEmail)!;
    const cookie = createPartnerSessionToken(tsiakkas, secret);
    const res = await patchProfile(
      jsonReq(
        "http://localhost:3000/api/partner/profile",
        "PATCH",
        { imageUrl: "https://evil.example/hero.jpg" },
        cookie,
        "203.0.113.30"
      )
    );
    expect(res.status).toBe(400);
  });
});

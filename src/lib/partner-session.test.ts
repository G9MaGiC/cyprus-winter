import { describe, expect, it } from "vitest";
import {
  PARTNER_SESSION_COOKIE,
  createPartnerSessionToken,
  verifyPartnerSessionToken,
} from "./partner-session";
import { findVerifiedPartnerByEmail } from "./partner-identity";

describe("partner identity", () => {
  it("resolves a verified winery by partnerEmail", () => {
    const partner = findVerifiedPartnerByEmail("bookings+tsiakkas@cyprus-winter.example");
    expect(partner?.providerId).toBe("tsiakkas");
    expect(partner?.kind).toBe("winery");
  });

  it("does not resolve an unknown email", () => {
    expect(findVerifiedPartnerByEmail("nobody@example.com")).toBeNull();
  });
});

describe("partner session token", () => {
  const secret = "partner-portal-secret-16";

  it("round-trips provider id inside an HttpOnly cookie name", () => {
    expect(PARTNER_SESSION_COOKIE).toBe("cw_partner_sess");
    const partner = findVerifiedPartnerByEmail("bookings+tsiakkas@cyprus-winter.example");
    expect(partner).toBeTruthy();
    const token = createPartnerSessionToken(partner!, secret);
    expect(verifyPartnerSessionToken(token, secret)?.providerId).toBe("tsiakkas");
  });

  it("rejects a token signed with a different secret", () => {
    const partner = findVerifiedPartnerByEmail("bookings+tsiakkas@cyprus-winter.example");
    const token = createPartnerSessionToken(partner!, secret);
    expect(verifyPartnerSessionToken(token, "other-secret-value")).toBeNull();
  });
});

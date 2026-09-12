import { describe, expect, it } from "vitest";
import {
  PARTNER_SESSION_COOKIE,
  createPartnerSessionToken,
  verifyPartnerSessionToken,
} from "./partner-session";
import { findVerifiedPartnerByEmail } from "./partner-identity";
import type { PartnerIdentity } from "./partner-identity";

describe("partner identity", () => {
  it("never resolves a placeholder-contact record (BUG-355 guard)", () => {
    // Zero verified partners until written authorization exists
    // (docs/PARTNER_DATA_VERIFICATION_2026-09-02.md); .example-domain
    // contacts must stay unresolvable even if a data flag flips back.
    expect(findVerifiedPartnerByEmail("bookings+tsiakkas@cyprus-winter.example")).toBeNull();
  });

  it("does not resolve an unknown email", () => {
    expect(findVerifiedPartnerByEmail("nobody@example.com")).toBeNull();
  });
});

describe("partner session token", () => {
  const secret = "partner-portal-secret-16";
  // Token mechanics are pinned against a fixture identity — signing must not
  // depend on which partners happen to be verified in the live catalog.
  const fixturePartner: PartnerIdentity = {
    providerId: "fixture-winery",
    providerName: "Fixture Winery",
    kind: "winery",
    email: "bookings@fixture-winery.example.org",
  };

  it("round-trips provider id inside an HttpOnly cookie name", () => {
    expect(PARTNER_SESSION_COOKIE).toBe("cw_partner_sess");
    const token = createPartnerSessionToken(fixturePartner, secret);
    expect(verifyPartnerSessionToken(token, secret)?.providerId).toBe("fixture-winery");
  });

  it("rejects a token signed with a different secret", () => {
    const token = createPartnerSessionToken(fixturePartner, secret);
    expect(verifyPartnerSessionToken(token, "other-secret-value")).toBeNull();
  });
});

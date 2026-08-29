import { describe, expect, it } from "vitest";
import { hasReachablePartnerEmail, isPartnerVerified } from "./partner-verification";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";

describe("partner-verification", () => {
  it("rejects RFC 2606 placeholder domains", () => {
    expect(hasReachablePartnerEmail("bookings+tsiakkas@cyprus-winter.example")).toBe(false);
    expect(hasReachablePartnerEmail("x@foo.test")).toBe(false);
    expect(hasReachablePartnerEmail("x@bar.invalid")).toBe(false);
    expect(hasReachablePartnerEmail("")).toBe(false);
    expect(hasReachablePartnerEmail(undefined)).toBe(false);
  });

  it("accepts real-looking partner addresses", () => {
    expect(hasReachablePartnerEmail("bookings@tsiakkas.com.cy")).toBe(true);
    expect(hasReachablePartnerEmail("  Info@Example-Winery.CY ")).toBe(true);
  });

  it("requires both the flag and a deliverable address", () => {
    expect(isPartnerVerified({ isVerified: true, partnerEmail: "a@b.example" })).toBe(false);
    expect(isPartnerVerified({ isVerified: false, partnerEmail: "a@b.cy" })).toBe(false);
    expect(isPartnerVerified({ isVerified: true, partnerEmail: "a@b.cy" })).toBe(true);
  });

  it("documents current data state: no partner shows verified until real emails land", () => {
    // Every isVerified record still carries a placeholder address; the badge
    // must therefore be hidden everywhere. Delete this assertion when the
    // first real partner address is wired (it will fail on purpose).
    expect([...wineries, ...guides].some((p) => isPartnerVerified(p))).toBe(false);
  });
});

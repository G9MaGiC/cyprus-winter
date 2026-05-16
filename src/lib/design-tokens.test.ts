import { describe, it, expect } from "vitest";
import { BOTTOM_NAV, LAYOUT } from "./design-tokens";

describe("LAYOUT mobile bottom chrome", () => {
  it("aligns footer and main clearance with BottomNav md breakpoint", () => {
    expect(LAYOUT.footerBottomClearance).toContain("md:pb-0");
    expect(LAYOUT.mainPaddingBottom).toContain("md:pb-0");
  });

  it("places sticky CTAs above nav with cookie offset", () => {
    expect(LAYOUT.fixedBottomAboveNavCookie).toContain("5.5rem");
    expect(LAYOUT.fixedBottomAboveNavCookie).toContain("--cw-cookie-banner-offset");
    expect(BOTTOM_NAV.stickyClearanceWithCookie).toContain("--cw-cookie-banner-offset");
  });

  it("hides mobile-only fixed chrome at md", () => {
    expect(LAYOUT.mobileBottomChromeHidden).toBe("md:hidden");
  });

  it("documents sticky offset as nav height plus gap", () => {
    expect(BOTTOM_NAV.height).toBe("4.5rem");
    expect(BOTTOM_NAV.stickyGap).toBe("1rem");
    expect(BOTTOM_NAV.stickyClearance).toContain("5.5rem");
  });
});

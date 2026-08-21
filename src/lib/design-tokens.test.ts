import { describe, it, expect } from "vitest";
import { BOTTOM_NAV, LAYOUT, STRIP, TYPE } from "./design-tokens";

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

describe("STRIP typography", () => {
  it("uses sans body styles for status strips, not display cardTitle", () => {
    expect(STRIP.label).toContain("text-sm");
    expect(STRIP.label).not.toContain("font-display");
    expect(STRIP.inlinePrimary).toContain("font-semibold");
    expect(STRIP.inlineRow).not.toContain("font-display");
  });

  it("defines sticky sand bar for hub filter surfaces", () => {
    expect(STRIP.stickySandBar).toContain("bg-sand/98");
    expect(STRIP.stickySandBar).toContain("backdrop-blur-md");
  });

  it("defines sticky bottom bar for fixed add CTAs on sand pages", () => {
    expect(STRIP.stickyBottomBar).toContain("bg-background/98");
    expect(STRIP.stickyBottomBar).toContain("border-t");
  });
});

describe("TYPE stat ramp", () => {
  it("uses sans for metric lines in info cards", () => {
    expect(TYPE.stat).not.toContain("font-display");
    expect(TYPE.stat).toContain("tabular-nums");
  });
});

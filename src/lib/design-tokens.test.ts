import { describe, it, expect } from "vitest";
import { BOTTOM_NAV, HOME, HERO, HUB, LAYOUT, STRIP, TYPE, CARD, MEDIA, BADGE, SEARCH, AI_TRIGGER, LOCATION } from "./design-tokens";

describe("HOME rhythm tokens", () => {
  it("defines tighter mobile section padding than hub SECTION.py", () => {
    expect(HOME.sectionPy).toContain("py-8");
    expect(HOME.sectionPy).toContain("lg:py-20");
    expect(HOME.sectionPySub).toContain("py-5");
    expect(HOME.headerMargin).toContain("mb-6");
    expect(HOME.gridGap).toBe("gap-4 sm:gap-6");
  });

  it("shortens hero on mobile for faster discovery", () => {
    expect(HERO.section).toContain("min-h-[62vh]");
    expect(HERO.section).toContain("pb-12");
    expect(HERO.panel).toContain("p-5 sm:p-10");
  });
});

describe("HUB rhythm tokens", () => {
  it("defines shared list hub shell and section padding", () => {
    expect(HUB.shellGap).toBe("gap-12 sm:gap-16");
    expect(HUB.sectionPy).toBe("py-6 sm:py-8");
  });
});

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

describe("CARD media tokens", () => {
  it("defines shared overlay and hover primitives", () => {
    expect(CARD.mediaOverlay).toContain("from-charcoal/75");
    expect(CARD.mediaOverlayLight).toContain("from-charcoal/60");
    expect(CARD.heroOverlay).toContain("from-charcoal/75");
    expect(MEDIA.hoverImage).toContain("scale-[1.02]");
    expect(MEDIA.hoverImage).toContain("motion-reduce");
  });
});

describe("BADGE tokens", () => {
  it("defines pill and chip shapes for card badges", () => {
    expect(BADGE.pill).toBe("rounded-full");
    expect(BADGE.chip).toContain("rounded-md");
    expect(BADGE.chip).toContain("backdrop-blur-sm");
  });
});

describe("SEARCH tokens", () => {
  it("defines combobox input, panel, and recovery link primitives", () => {
    expect(SEARCH.input).toContain("min-h-[44px]");
    expect(SEARCH.input).toContain("focus-visible:ring-terracotta/20");
    expect(SEARCH.panel).toContain("bg-sand-100/95");
    expect(SEARCH.optionActive).toBe("bg-terracotta/10");
    expect(SEARCH.recoveryLink).toContain("border-sand-200/80");
  });
});

describe("AI_TRIGGER tokens", () => {
  it("defines golden default trigger with reduced-motion press", () => {
    expect(AI_TRIGGER.default).toContain("bg-golden");
    expect(AI_TRIGGER.default).toContain("motion-reduce:active:scale-100");
    expect(AI_TRIGGER.iconBadge).toContain("bg-charcoal/10");
    expect(AI_TRIGGER.disabled).toContain("opacity-60");
  });
});

describe("LOCATION tokens", () => {
  it("defines terracotta primary and ghost secondary for consent actions", () => {
    expect(LOCATION.primary).toContain("bg-terracotta");
    expect(LOCATION.primary).toContain("min-h-[44px]");
    expect(LOCATION.secondary).toContain("text-muted-ink");
  });
});

describe("TYPE stat ramp", () => {
  it("uses sans for metric lines in info cards", () => {
    expect(TYPE.stat).not.toContain("font-display");
    expect(TYPE.stat).toContain("tabular-nums");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getTrailPlaceOfDayPick } from "./trail-place-of-day";

describe("discover loading shell", () => {
  it("matches live discover background sand", () => {
    const loading = readFileSync("src/app/(padded)/discover/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/discover/page.tsx", "utf8");
    expect(page).toContain("bg-sand");
    expect(loading).toContain("bg-sand");
    expect(loading).not.toMatch(/min-h-screen bg-background/);
  });

  it("uses sand sticky bar token on filter skeleton", () => {
    const loading = readFileSync("src/app/(padded)/discover/loading.tsx", "utf8");
    expect(loading).toContain("STRIP.stickySandBar");
  });
});

describe("sticky filter bar", () => {
  it("uses sand sticky surface on hub filter bars", () => {
    const bar = readFileSync("src/components/StickyFilterBar.tsx", "utf8");
    expect(bar).toContain("STRIP.stickySandBar");
    expect(bar).not.toContain("bg-background/98");
  });
});

describe("plan day selector sticky bar", () => {
  it("uses sand sticky surface token instead of inline bg-sand/98", () => {
    const selector = readFileSync("src/components/plan/DaySelector.tsx", "utf8");
    expect(selector).toContain("STRIP.stickySandBar");
    expect(selector).not.toContain("bg-sand/98");
  });
});

describe("trail map direction links", () => {
  it("uses 44px touch-target token for map CTAs", () => {
    const map = readFileSync("src/components/TrailMap.tsx", "utf8");
    expect(map).toContain("SECTION.mapDirectionsLink");
  });
});

describe("winery booking loading shell", () => {
  it("uses sand background like the live booking page", () => {
    const loading = readFileSync("src/app/(padded)/book/winery/[id]/loading.tsx", "utf8");
    expect(loading).toContain("min-h-screen bg-sand");
  });
});

describe("events loading shell", () => {
  it("uses sand background and hero skeleton like the live events page", () => {
    const loading = readFileSync("src/app/(padded)/events/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/events/EventsPageClient.tsx", "utf8");
    expect(page).toContain("min-h-screen bg-sand");
    expect(loading).toContain("min-h-screen bg-sand");
    expect(loading).toContain("HeroSkeleton");
  });

  it("uses sand sticky bar token on filter skeleton", () => {
    const loading = readFileSync("src/app/(padded)/events/loading.tsx", "utf8");
    expect(loading).toContain("STRIP.stickySandBar");
    expect(loading).not.toContain("bg-background/98");
  });
});

describe("trails loading shell", () => {
  it("uses sand background and hero skeleton like the live trails page", () => {
    const loading = readFileSync("src/app/(padded)/trails/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/trails/TrailsClient.tsx", "utf8");
    expect(page).toContain("min-h-screen bg-sand");
    expect(loading).toContain("min-h-screen bg-sand");
    expect(loading).toContain("HeroSkeleton");
  });

  it("uses sand sticky bar token on filter skeleton", () => {
    const loading = readFileSync("src/app/(padded)/trails/loading.tsx", "utf8");
    expect(loading).toContain("STRIP.stickySandBar");
    expect(loading).not.toContain("bg-background/98");
  });
});

describe("plan loading shell", () => {
  it("uses sand background and hero skeleton like the live plan page", () => {
    const loading = readFileSync("src/app/(padded)/plan/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/plan/PlanPageClient.tsx", "utf8");
    expect(page).toContain("min-h-screen bg-sand");
    expect(loading).toContain("min-h-screen bg-sand");
    expect(loading).toContain("HeroSkeleton");
  });

  it("uses sand sticky bar token on day selector skeleton", () => {
    const loading = readFileSync("src/app/(padded)/plan/loading.tsx", "utf8");
    expect(loading).toContain("STRIP.stickySandBar");
    expect(loading).not.toContain("bg-background/98");
  });
});

describe("plan sticky add bar", () => {
  it("uses bottom bar token instead of inline bg-background/98", () => {
    const bar = readFileSync("src/components/plan/PlanStickyAddBar.tsx", "utf8");
    expect(bar).toContain("STRIP.stickyBottomBar");
    expect(bar).not.toContain("bg-background/98");
  });
});

describe("list page widget strip", () => {
  it("requires i18n ariaLabel instead of hardcoded EN default", () => {
    const strip = readFileSync("src/components/ListPageWidgetStrip.tsx", "utf8");
    expect(strip).toMatch(/ariaLabel:\s*string/);
    expect(strip).not.toMatch(/ariaLabel\s*=\s*"Page filters and stats"/);
  });
});

describe("deprecated home/itinerary cleanup", () => {
  it("does not keep the deprecated HomeHero wrapper", () => {
    expect(() => readFileSync("src/app/_home/HomeHero.tsx", "utf8")).toThrow();
  });

  it("does not export WINTER_TEMPLATES from useItinerary", () => {
    const src = readFileSync("src/hooks/useItinerary.ts", "utf8");
    expect(src).not.toContain("WINTER_TEMPLATES");
  });

  it("does not keep empty DAY_COMBOS / discover editors pool", () => {
    expect(readFileSync("src/data/day-combos.ts", "utf8")).not.toContain("DAY_COMBOS");
    expect(readFileSync("src/data/home.ts", "utf8")).not.toContain("discoverEditorsPicks");
  });
});

describe("discover detail loading shell", () => {
  it("uses sand background and detail hero skeleton like the live page", () => {
    const loading = readFileSync("src/app/(padded)/discover/[id]/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/discover/[id]/page.tsx", "utf8");
    expect(page).toContain("min-h-screen bg-sand");
    expect(loading).toContain("min-h-screen bg-sand");
    expect(loading).toContain("DetailHeroSkeleton");
    expect(loading).toContain("SKELETON.media");
    expect(loading).toContain("STRIP.stickyBottomBar");
    expect(loading).toContain("LAYOUT.detailMobileStickyClearance");
  });
});

describe("bookings loading shell", () => {
  it("uses sand background and page header skeleton like the live page", () => {
    const loading = readFileSync("src/app/(padded)/bookings/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/bookings/page.tsx", "utf8");
    expect(page).toContain("min-h-screen bg-sand");
    expect(loading).toContain("min-h-screen bg-sand");
    expect(loading).toContain("PageHeaderSkeleton");
    expect(loading).toContain("BookingCardSkeleton");
  });
});

describe("search loading shell", () => {
  it("uses sand background and search result skeleton like the live page", () => {
    const loading = readFileSync("src/app/(padded)/search/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/search/page.tsx", "utf8");
    expect(page).toContain("LAYOUT.form");
    expect(loading).toContain("min-h-screen bg-sand");
    expect(loading).toContain("SearchResultSkeleton");
    expect(loading).toContain("NavSkeleton");
  });
});

describe("plan share copy feedback", () => {
  it("uses terracotta ring on copied state in PlanShareBar", () => {
    const bar = readFileSync("src/components/plan/PlanShareBar.tsx", "utf8");
    expect(bar).toContain("ring-terracotta/40");
    expect(bar).toContain("CopyCheckIcon");
    expect(bar).toContain("copySuccessClass");
  });
});

describe("pwa install prompt", () => {
  it("mounts InstallPromptBanner from SerwistProvider", () => {
    const serwist = readFileSync("src/app/serwist/index.tsx", "utf8");
    const banner = readFileSync("src/components/InstallPromptBanner.tsx", "utf8");
    expect(serwist).toContain("InstallPromptBanner");
    expect(banner).toContain("PWA_INSTALL_DISMISSED_KEY");
    expect(banner).toContain("beforeinstallprompt");
  });
});

describe("filter chips layout stress", () => {
  it("caps chip width on narrow viewports for long locale strings", () => {
    const chips = readFileSync("src/components/FilterChips.tsx", "utf8");
    expect(chips).toContain("max-w-[min(100%,11rem)]");
    expect(chips).toContain("truncate");
  });
});

describe("home state-aware discovery sections", () => {
  it("delegates editors and book tastings to HomeDiscoverySections client gate", () => {
    const content = readFileSync("src/app/_home/HomePageContent.tsx", "utf8");
    const adaptive = readFileSync("src/app/_home/HomeDiscoverySections.tsx", "utf8");
    expect(content).toContain("HomeDiscoverySections");
    expect(content).toContain("EditorsPicks");
    expect(content).toContain("BookTastings");
    expect(adaptive).toContain("useItinerary");
    expect(adaptive).toContain("hasContent");
    expect(adaptive).toContain("children");
    expect(adaptive).not.toContain("EditorsPicks");
  });
});

describe("visual QA gate (Phase E)", () => {
  it("defines viewport helpers and gate spec for 375/768/RTL", () => {
    const helper = readFileSync("e2e/helpers/visual-qa.ts", "utf8");
    const spec = readFileSync("e2e/visual-qa-gate.spec.ts", "utf8");
    expect(helper).toContain("VIEWPORT_MOBILE");
    expect(helper).toContain("width: 375");
    expect(helper).toContain("VIEWPORT_TABLET");
    expect(helper).toContain("width: 768");
    expect(helper).toContain("expectNoHorizontalOverflow");
    expect(spec).toContain("@375px Hebrew RTL");
    expect(spec).toContain("/he/discover");
  });

  it("chains visual gate into test:e2e:gate:ci", () => {
    const pkg = readFileSync("package.json", "utf8");
    expect(pkg).toContain("test:e2e:visual-gate:ci");
    expect(pkg).toContain("visual-qa-gate.spec.ts");
  });
});

describe("chrome token adoption (Phase D)", () => {
  it("SearchBar uses SEARCH tokens for input and panels", () => {
    const bar = readFileSync("src/components/SearchBar.tsx", "utf8");
    expect(bar).toContain("SEARCH.input");
    expect(bar).toContain("SEARCH.panel");
    expect(bar).toContain("SEARCH.recoveryLink");
    expect(bar).not.toMatch(/className="w-full min-h-\[44px\] pl-11/);
  });

  it("AIAssistantTrigger uses AI_TRIGGER and CTA.tertiaryOnDark", () => {
    const trigger = readFileSync("src/components/AIAssistantTrigger.tsx", "utf8");
    expect(trigger).toContain("AI_TRIGGER.default");
    expect(trigger).toContain("CTA.tertiaryOnDark");
    expect(trigger).toContain("AI_TRIGGER.iconBadge");
  });

  it("LocationActionButtons uses LOCATION tokens", () => {
    const loc = readFileSync("src/components/LocationActionButtons.tsx", "utf8");
    expect(loc).toContain("LOCATION.primary");
    expect(loc).toContain("LOCATION.secondary");
  });
});

describe("home section rhythm", () => {
  it("HomeSection uses HOME.sectionPy instead of ad-hoc padding", () => {
    const section = readFileSync("src/app/_home/HomeSection.tsx", "utf8");
    expect(section).toContain("HOME.sectionPy");
    expect(section).toContain("HOME.headerMargin");
    expect(section).not.toMatch(/py-10 sm:py-16/);
  });
});

describe("home section reveal", () => {
  it("wraps exactly three content sections with HomeSectionReveal", () => {
    const content = readFileSync("src/app/_home/HomePageContent.tsx", "utf8");
    const matches = content.match(/<HomeSectionReveal/g);
    expect(matches?.length).toBe(3);
    expect(content).toContain('index={0}');
    expect(content).toContain('index={1}');
    expect(content).toContain('index={2}');
  });

  it("uses section-reveal class in HomeSectionReveal client wrapper", () => {
    const reveal = readFileSync("src/app/_home/HomeSectionReveal.tsx", "utf8");
    expect(reveal).toContain("section-reveal");
    expect(reveal).toContain("700");
  });
});

describe("trail place of day overlay keys", () => {
  it("returns a localizable overlayKey instead of English overlay copy", () => {
    const pick = getTrailPlaceOfDayPick();
    expect(pick).not.toBeNull();
    expect(["openWithTemp", "open", "caution", "seeConditions"]).toContain(pick!.overlayKey);
    expect(pick).not.toHaveProperty("overlay");
  });
});

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

describe("trail place of day overlay keys", () => {
  it("returns a localizable overlayKey instead of English overlay copy", () => {
    const pick = getTrailPlaceOfDayPick();
    expect(pick).not.toBeNull();
    expect(["openWithTemp", "open", "caution", "seeConditions"]).toContain(pick!.overlayKey);
    expect(pick).not.toHaveProperty("overlay");
  });
});

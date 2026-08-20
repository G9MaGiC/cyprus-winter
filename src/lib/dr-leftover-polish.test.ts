import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("discover loading shell", () => {
  it("matches live discover background sand", () => {
    const loading = readFileSync("src/app/(padded)/discover/loading.tsx", "utf8");
    const page = readFileSync("src/app/(padded)/discover/page.tsx", "utf8");
    expect(page).toContain("bg-sand");
    expect(loading).toContain("bg-sand");
    expect(loading).not.toMatch(/min-h-screen bg-background/);
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
});

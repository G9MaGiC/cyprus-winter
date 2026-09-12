import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { homeEditorsPicks, homeFeaturedWineries } from "@/data/home";
import { wineries } from "@/data/wineries";
import {
  classifyTrailImageSource,
  classifyWineryImageSource,
  resolveWineryImage,
} from "@/lib/cyprus-images";
import {
  GENERIC_WINERY_FALLBACK,
  OMODOS_TASTING_IMAGE,
  isAllowedOmodosTastingImage,
  isTrustedWineryHero,
} from "@/lib/photography-trust";

const VERIFIED_IDS = wineries.filter((w) => w.isVerified).map((w) => w.id);

describe("photography trust — home editorial", () => {
  it("editors picks use committed place-specific images on disk", () => {
    for (const pick of homeEditorsPicks) {
      expect(pick.image.startsWith("/images/"), pick.id).toBe(true);
      expect(existsSync(join(process.cwd(), "public", pick.image)), `${pick.id} ${pick.image}`).toBe(
        true
      );
    }
  });

  it("editors pick Artemis uses an official Visit Cyprus trail hero", () => {
    const artemis = homeEditorsPicks.find((p) => p.id === "artemis");
    expect(artemis).toBeDefined();
    expect(classifyTrailImageSource("artemis")).toBe("official");
    expect(artemis!.image).toContain("/images/cyprus/trails/trail-artemis.jpg");
  });

  it("editors picks avoid generic winery troodos fallback", () => {
    for (const pick of homeEditorsPicks) {
      expect(pick.image).not.toBe(GENERIC_WINERY_FALLBACK);
    }
  });
});

describe("photography trust — home book funnel", () => {
  it("featured wineries use per-id or partner hero assets", () => {
    for (const featured of homeFeaturedWineries) {
      expect(isTrustedWineryHero(featured.wineryId), featured.wineryId).toBe(true);
      expect(featured.image).toBe(resolveWineryImage(featured.wineryId));
      expect(existsSync(join(process.cwd(), "public", featured.image))).toBe(true);
    }
  });

  it("all verified partners resolve to trusted hero sources", () => {
    // Zero verified partners until written authorization exists
    // (2026-09-02 verification pass). Revisit this count when a real
    // partner onboards; the loop below is the per-partner guard.
    expect(VERIFIED_IDS.length).toBe(0);
    for (const id of VERIFIED_IDS) {
      expect(isTrustedWineryHero(id), id).toBe(true);
      expect(resolveWineryImage(id)).not.toBe(GENERIC_WINERY_FALLBACK);
      expect(classifyWineryImageSource(id)).not.toBe("fallback");
    }
  });
});

describe("photography trust — cross-region guards", () => {
  it("restricts Omodos tasting photo to Omodos-area wineries", () => {
    for (const winery of wineries) {
      const url = resolveWineryImage(winery.id);
      expect(isAllowedOmodosTastingImage(winery.id, url), `${winery.id} -> ${url}`).toBe(true);
    }
    expect(resolveWineryImage("oenou-yi")).toBe(OMODOS_TASTING_IMAGE);
    expect(resolveWineryImage("mystes")).not.toBe(OMODOS_TASTING_IMAGE);
  });
});

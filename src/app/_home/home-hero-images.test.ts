import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { pickHomeHeroImage } from "./home-hero-images";

describe("pickHomeHeroImage", () => {
  it("returns a known hero from the seasonal pool", () => {
    const hero = pickHomeHeroImage();
    expect(hero.src).toMatch(/^\/images\/cyprus\//);
    expect(["troodosTrail", "omodosVillage", "winterVineyard", "kourionCoast"]).toContain(
      hero.altKey
    );
  });
});

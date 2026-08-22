import "server-only";

import { pickDailyWithKey } from "@/lib/daily-rotator";

export type HomeHeroImage = {
  id: string;
  src: string;
  /** i18n key under home.hero.images.* */
  altKey: "troodosTrail" | "omodosVillage" | "winterVineyard" | "kourionCoast";
  objectPosition?: string;
};

const HERO_POOL: HomeHeroImage[] = [
  {
    id: "troodos-trail",
    src: "/images/cyprus/trails/trail-artemis.jpg",
    altKey: "troodosTrail",
    objectPosition: "center 40%",
  },
  {
    id: "omodos-village",
    src: "/images/cyprus/cyprus-village-omodos.jpg",
    altKey: "omodosVillage",
  },
  {
    id: "winter-vineyard",
    src: "/images/cyprus/cyprus-vineyard-lofou-january.jpg",
    altKey: "winterVineyard",
  },
  {
    id: "kourion-coast",
    src: "/images/cyprus/cyprus-ancient-kourion.jpg",
    altKey: "kourionCoast",
    objectPosition: "center 35%",
  },
];

/** Seasonal weighting: winter months favour Troodos + village; spring shoulder adds coast. */
function seasonalPool(): HomeHeroImage[] {
  const m = new Date().getMonth();
  if (m >= 10 || m <= 2) {
    return [HERO_POOL[0], HERO_POOL[1], HERO_POOL[2], HERO_POOL[3]];
  }
  if (m === 3) {
    return [HERO_POOL[0], HERO_POOL[3], HERO_POOL[2], HERO_POOL[1]];
  }
  return [HERO_POOL[3], HERO_POOL[1], HERO_POOL[2], HERO_POOL[0]];
}

/** Deterministic daily hero image (SSG-safe). */
export function pickHomeHeroImage(): HomeHeroImage {
  return pickDailyWithKey(seasonalPool(), "home-hero-image");
}

import "server-only";

import type { HomeHeroCopy } from "@/app/_home/HomeHeroView";
import { getTranslations } from "next-intl/server";

function getSeasonalKey(): "lateYear" | "earlyYear" | "march" | "spring" {
  const m = new Date().getMonth();
  if (m >= 10) return "lateYear";
  if (m <= 2) return "earlyYear";
  if (m === 3) return "march";
  return "spring";
}

export async function getHomeHeroCopy(locale?: string): Promise<HomeHeroCopy> {
  const tHome = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");
  const seasonalKey = getSeasonalKey();

  return {
    imageAlt: tHome("hero.imageAlt"),
    kicker: tHome("kicker"),
    title: tHome("title"),
    headline: tHome("headline"),
    seasonalLine: `${tHome(`seasonal.${seasonalKey}`)} ${tHome("degreesLine")}`,
    familyPicksLabel: "Family-friendly picks",
    templateLabel: "48-hour template",
    exploreCta: tHome("cta.explore"),
    planCta: tHome("cta.planTrip"),
    arrivingCta: tHome("cta.arriving"),
    askGuideCta: tHome("cta.askGuide"),
    discoverAria: tHome("aria.discover"),
    planAria: tHome("aria.plan"),
    airportAria: tHome("aria.airport"),
  };
}

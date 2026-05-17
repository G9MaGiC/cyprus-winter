import "server-only";

import { getHomeHeroCopy } from "@/app/_home/home-hero-copy";
import HomeHeroView from "@/app/_home/HomeHeroView";

/** @deprecated Prefer getHomeHeroCopy + HomeHeroView from the locale page. */
export default async function HomeHero() {
  const copy = await getHomeHeroCopy();
  return <HomeHeroView {...copy} />;
}

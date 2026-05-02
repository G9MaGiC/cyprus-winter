import type { Metadata } from "next";
import Link from "next/link";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { discoverListPageMeta } from "@/lib/locale-page-meta";
import { SITE_URL } from "@/lib/site-url";
import { allDiscoverItems } from "@/data/discover";
import { buildDiscoverSections } from "@/lib/discover-sections";
import { buildDiscoverItemListSchema } from "@/lib/discover-schema";
import { CTA, LAYOUT } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import SearchBar from "@/components/SearchBar";
import DiscoverPlaceOfDay from "./DiscoverPlaceOfDay";
import DiscoverMapSection from "./DiscoverMapSection";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = applyLocaleToMetadata(
  discoverListPageMeta,
  "/discover",
  routing.defaultLocale
);

const sections = buildDiscoverSections(allDiscoverItems);

const discoverItemListSchema = buildDiscoverItemListSchema(allDiscoverItems, SITE_URL);

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-sand">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(discoverItemListSchema) }} />
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col gap-12 sm:gap-16 md:gap-20`}>
        <ListPageHero
          backHref="/"
          backLabel="Home"
          title="Discover Cyprus Winter"
          description="Curated places, real feel. Beaches, villages, wineries—what to pair with what."
          backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
          backgroundImageAlt="Omodos village, wine heartland, cobbled streets—Cyprus winter"
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Discover", href: "/discover", isCurrent: true }]}
        >
          <Link href="/plan" className={`${CTA.tertiaryOnDark} mt-4 inline-block`} aria-label="Build a day or pick a template">
            Plan your trip
          </Link>
        </ListPageHero>

        <section
          aria-labelledby="discover-search-heading"
          role="search"
          className={`${LAYOUT.safeAreaX} -mt-4`}
        >
          <div className={`${LAYOUT.list} mx-auto`}>
            <h2 id="discover-search-heading" className="sr-only">
              Search places
            </h2>
            <SearchBar
              placeholder="Search places, trails, wineries…"
              className="max-w-2xl mx-auto"
            />
          </div>
        </section>

        <DiscoverPlaceOfDay />

        <div id="discover-plan-sentinel" className="h-px pointer-events-none" aria-hidden />

        <DiscoverClient sections={sections}>
          <DiscoverMapSection />
        </DiscoverClient>
      </div>
    </div>
  );
}

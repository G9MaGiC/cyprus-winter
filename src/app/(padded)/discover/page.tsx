import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
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
import { getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

export const metadata: Metadata = {
  title: "Discover Cyprus Winter | Beaches, Villages, Wineries",
  description:
    "Cyprus in winter: curated places that feel real. Beaches, ancient sites, villages, wineries—Nissi, Paphos mosaics, Lefkara. Sixteen degrees when home is six.",
  alternates: { canonical: `${SITE_URL}/discover` },
  openGraph: {
    title: "Discover Cyprus Winter | Beaches, Villages, Wineries",
    description: "Cyprus in winter: curated places that feel real. Beaches, villages, wineries, ancient sites.",
    url: `${SITE_URL}/discover`,
    type: "website",
  },
};

const sections = buildDiscoverSections(allDiscoverItems);
const discoverItemListSchema = buildDiscoverItemListSchema(allDiscoverItems, SITE_URL);

export default async function DiscoverPage() {
  const [tNav, tCommon, tDiscover] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("discover"),
  ]);
  return (
    <div className="min-h-screen bg-sand">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(discoverItemListSchema) }} />
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col gap-12 sm:gap-16 md:gap-20`}>
        <ListPageHero
          backHref="/"
          backLabel={tNav("home")}
          title={tDiscover("page.hero.title")}
          description={tDiscover("page.hero.description")}
          backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
          backgroundImageAlt={tDiscover("page.hero.imageAlt")}
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("discover"), href: "/discover", isCurrent: true }]}
        >
          <AppLink href="/plan" className={`${CTA.tertiaryOnDark} mt-4 inline-block`} aria-label={tDiscover("page.hero.planAria")}>
            {tCommon("planYourTrip")}
          </AppLink>
        </ListPageHero>

        <section
          aria-labelledby="discover-search-heading"
          role="search"
          className={`${LAYOUT.safeAreaX} -mt-4`}
        >
          <div className={`${LAYOUT.list} mx-auto`}>
            <h2 id="discover-search-heading" className="sr-only">
              {tDiscover("page.search.srHeading")}
            </h2>
            <SearchBar
              placeholder={tDiscover("page.search.placeholder")}
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

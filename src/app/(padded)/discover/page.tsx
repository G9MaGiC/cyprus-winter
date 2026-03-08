import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import {
  beaches,
  natureSites,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { CTA, LAYOUT, SECTION } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import SearchBar from "@/components/SearchBar";
import DiscoverPlaceOfDay from "./DiscoverPlaceOfDay";
import DiscoverEditorPicks from "./DiscoverEditorPicks";
import DiscoverDayCombos from "./DiscoverDayCombos";
import DiscoverMapSection from "./DiscoverMapSection";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = {
  title: "Discover Cyprus Winter | Beaches, Villages, Wineries",
  description:
    "Cyprus in winter: curated places that feel real. Beaches, ancient sites, villages, wineries—Nissi, Paphos mosaics, Lefkara. Sixteen degrees when home is six. Free guide.",
  alternates: { canonical: `${SITE_URL}/discover` },
  openGraph: {
    title: "Discover Cyprus Winter | Beaches, Villages, Wineries",
    description: "Cyprus in winter: curated places that feel real. Beaches, villages, wineries, ancient sites. Free guide.",
    url: `${SITE_URL}/discover`,
    type: "website",
  },
};

const allDiscoverItems = [
  ...beaches,
  ...natureSites,
  ...ancientSites,
  ...villages,
  ...wineries,
  ...restaurants,
  ...monasteries,
];
const isFamilyFriendly = (item: { bestFor?: string[] }) =>
  item.bestFor?.some(
    (b) => b.toLowerCase().includes("famil") || b.toLowerCase().includes("family")
  ) ?? false;
const familyItems = allDiscoverItems.filter(isFamilyFriendly);

const isOffBeatenPath = (item: { bestFor?: string[]; localSecret?: string }) =>
  item.bestFor?.some(
    (b) =>
      b.toLowerCase().includes("off-the-beaten-path") ||
      b.toLowerCase().includes("hidden gem")
  ) || !!item.localSecret;
const quietItems = allDiscoverItems.filter(isOffBeatenPath);

const sections = [
  { id: "beach", title: "Beaches", items: beaches },
  { id: "nature", title: "Nature & coasts", items: natureSites },
  { id: "ancient", title: "Ancient sites", items: ancientSites },
  { id: "village", title: "Villages", items: villages },
  { id: "winery", title: "Wineries", items: wineries },
  { id: "eat", title: "Eat & drink", items: restaurants },
  { id: "monastery", title: "Monasteries & culture", items: monasteries },
  { id: "family", title: "Family-friendly", items: familyItems },
  { id: "quiet", title: "Off the beaten path", items: quietItems },
];

const discoverItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Discover Cyprus Winter",
  description: "Beaches, ancient sites, villages, wineries, monasteries. Curated Cyprus winter places.",
  url: `${SITE_URL}/discover`,
  numberOfItems: allDiscoverItems.length,
  itemListElement: allDiscoverItems.slice(0, 50).map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "TouristAttraction",
      name: item.name,
      description: item.description.slice(0, 160),
      url: `${SITE_URL}/discover/${item.id}`,
      address: { "@type": "PostalAddress", addressLocality: item.region, addressCountry: "CY" },
    },
  })),
};

export default function DiscoverPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(discoverItemListSchema) }} />
      <ListPageHero
        backHref="/"
        backLabel="Home"
        title="Discover Cyprus Winter"
        description="Places that feel real. What to pair each place with—your guide, not a brochure."
        backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
        backgroundImageAlt="Omodos village, wine heartland, cobbled streets—Cyprus winter"
      >
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Link href="/plan" className={CTA.tertiaryOnDark}>
            Plan your trip
          </Link>
          <Link href="/weather" className={CTA.tertiaryOnDark}>
            Weather
          </Link>
          <Link href="/trails" className={CTA.tertiaryOnDark}>
            Trails
          </Link>
        </div>
      </ListPageHero>

      <section aria-labelledby="discover-search-heading" className={`${LAYOUT.safeAreaX} ${SECTION.pySub} section-reveal`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2 id="discover-search-heading" className="text-center text-olive font-display text-xl sm:text-2xl font-semibold mb-3">
            Find a place
          </h2>
          <SearchBar placeholder="Search places, trails, wineries…" className="max-w-xl mx-auto" syncUrl />
        </div>
      </section>

      <DiscoverPlaceOfDay />

      <section aria-labelledby="discover-editors-picks-heading" className={`${SECTION.pySub} ${SECTION.alt} ${LAYOUT.safeAreaX}`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2 id="discover-editors-picks-heading" className="text-center font-display text-2xl sm:text-3xl font-semibold text-charcoal mb-2">
            Editor&apos;s picks
          </h2>
          <p className="text-sage text-sm sm:text-base text-center max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Four places we keep coming back to in winter. Save them to your plan.
          </p>
          <DiscoverEditorPicks />
        </div>
      </section>

      <DiscoverDayCombos />

      <DiscoverMapSection />

      <DiscoverClient sections={sections} />
    </div>
  );
}

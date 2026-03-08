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
import { CTA, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import SearchBar from "@/components/SearchBar";
import DiscoverPlaceOfDay from "./DiscoverPlaceOfDay";
import DiscoverMapSection from "./DiscoverMapSection";
import DiscoverClient from "./DiscoverClient";

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

const coastsItems = [...beaches, ...natureSites];
const wineAndFoodItems = [...wineries, ...restaurants];
const hiddenGemsItems = [...familyItems, ...quietItems].filter(
  (item, i, arr) => arr.findIndex((x) => x.id === item.id) === i
);

const sections = [
  { id: "coasts", title: "Coasts", items: coastsItems },
  { id: "ancient", title: "Ancient sites", items: ancientSites },
  { id: "village", title: "Villages", items: villages },
  { id: "wine", title: "Wine & food", items: wineAndFoodItems },
  { id: "monastery", title: "Monasteries & culture", items: monasteries },
  { id: "hidden", title: "Hidden gems", items: hiddenGemsItems },
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
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Discover", href: "/discover", isCurrent: true }]}
      >
        <Link href="/plan" className={`${CTA.tertiaryOnDark} mt-4 inline-block`}>
          Plan your trip
        </Link>
      </ListPageHero>

      <section aria-labelledby="discover-search-heading" className={`${LAYOUT.safeAreaX} ${SECTION.pySub} section-reveal`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2 id="discover-search-heading" className={`text-center ${TYPE.sectionTitle} ${SECTION.headingGap}`}>
            Find a place
          </h2>
          <SearchBar placeholder="Search places, trails, wineries…" className="max-w-xl mx-auto" syncUrl />
        </div>
      </section>

      <DiscoverPlaceOfDay />

      <DiscoverClient sections={sections} />

      <DiscoverMapSection />
    </div>
  );
}

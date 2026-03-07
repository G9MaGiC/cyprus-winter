import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import {
  beaches,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { LAYOUT } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = {
  title: "Discover Cyprus Winter | Beaches, Villages, Wineries",
  description:
    "Beaches, ancient sites, villages, wineries, monasteries. Curated Cyprus winter places—Nissi, Paphos mosaics, Lefkara, Troodos. Plan or explore when you land. Sixteen degrees when home is six.",
  alternates: { canonical: `${SITE_URL}/discover` },
};

const allDiscoverItems = [
  ...beaches,
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

const sections = [
  { id: "beach", title: "Beaches", items: beaches },
  { id: "ancient", title: "Ancient sites", items: ancientSites },
  { id: "village", title: "Villages", items: villages },
  { id: "winery", title: "Wineries", items: wineries },
  { id: "eat", title: "Eat & drink", items: restaurants },
  { id: "monastery", title: "Monasteries & culture", items: monasteries },
  { id: "family", title: "Family-friendly", items: familyItems },
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
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} overflow-x-hidden`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(discoverItemListSchema) }} />
      <ListPageHero
        backHref="/"
        backLabel="Home"
        title="Discover Cyprus Winter"
        description="Beaches, ruins, villages, wineries, monasteries. What to pair each place with—your guide, not a brochure."
        backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
        backgroundImageAlt="Omodos village, wine heartland, cobbled streets—Cyprus winter"
      />

      <DiscoverClient sections={sections} />

      <p className="mt-12 sm:mt-16 text-center text-olive/70 text-sm max-w-md mx-auto prose-body break-words">
        Start with one place. Pair it with a trail or a tasting. Or tap Ask AI—it knows the island in winter.
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import {
  beaches,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { CTA, LAYOUT } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
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
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} overflow-x-hidden`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(discoverItemListSchema) }} />
      <ListPageHero
        backHref="/"
        backLabel="Home"
        title="Discover Cyprus Winter"
        description="Places that feel real. What to pair each place with—your guide, not a brochure."
        backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
        backgroundImageAlt="Omodos village, wine heartland, cobbled streets—Cyprus winter"
      >
        <Link href="/plan" className={`inline-flex items-center min-h-[44px] mt-4 ${CTA.tertiaryOnDark}`}>
          Plan your trip
        </Link>
      </ListPageHero>

      <DiscoverClient sections={sections} />

      <p className="mt-12 sm:mt-16 text-center text-olive/70 text-sm max-w-md mx-auto prose-body break-words">
        Start with one place. Pair it with a trail or a tasting. Or tap Ask AI—it knows the island in winter.
      </p>
    </div>
  );
}

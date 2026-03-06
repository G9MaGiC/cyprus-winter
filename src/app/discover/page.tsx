import type { Metadata } from "next";
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
    "Beaches, ancient sites, villages, wineries, monasteries. Curated Cyprus winter places—Nissi, Paphos mosaics, Lefkara, Troodos. Plan or explore. Sixteen degrees when home is six.",
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

export default function DiscoverPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} overflow-x-hidden`}>
      <ListPageHero
        backHref="/"
        backLabel="Home"
        title="Discover Cyprus Winter"
        description="Sixteen degrees when home is six. Beaches, ruins, villages, wineries, monasteries—what to pair each place with. Your guide, not a brochure."
        backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
        backgroundImageAlt="Omodos village, wine heartland, cobbled streets—Cyprus winter"
      />

      <DiscoverClient sections={sections} />

      <p className="mt-12 sm:mt-16 text-center text-olive/70 text-sm max-w-md mx-auto prose-body break-words">
        Start with one place. Add a trail or a tasting. Or ask the AI—it knows the island in winter.
      </p>
    </div>
  );
}

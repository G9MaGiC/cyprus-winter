export type WineRoute = {
  slug: string;
  title: string;
  description: string;
  grapeVarieties: string[];
  center: { lat: number; lng: number };
  winterTip: string;
  heroImage: string;
};

export const WINE_ROUTES: WineRoute[] = [
  {
    slug: "krasochoria",
    title: "Krasochoria",
    description:
      "The Limassol wine villages—Omodos, Koilani, Louvaras, Pera Pedi, Pelendri. Mountain views, indigenous varieties, Commandaria-style sweet wines. Call ahead Nov–Mar.",
    grapeVarieties: ["Mavro", "Xynisteri", "Maratheftiko", "Cabernet Sauvignon"],
    center: { lat: 34.85, lng: 32.82 },
    winterTip: "Most cellars open weekends only in winter. Call a day ahead and you'll often get the winemaker pouring.",
    heroImage: "/images/cyprus/cyprus-wine-village.jpg",
  },
  {
    slug: "laona",
    title: "Laona",
    description:
      "Paphos hill villages—Panayia, Lemona, Stroumbi, Statos. Cozy tastings, old vines, winter fireside. Distinct from the Commandaria UNESCO zone.",
    grapeVarieties: ["Xynisteri", "Maratheftiko", "Promara", "Spourtiko"],
    center: { lat: 34.93, lng: 32.52 },
    winterTip: "Winter visitors get fireside tastings and unhurried tours. Vouni Panayia and Tsangarides are the anchor stops.",
    heroImage: "/images/cyprus/cyprus-paphos-hills.jpg",
  },
  {
    slug: "akamas",
    title: "Akamas",
    description:
      "Kathikas and the Akamas peninsula. Dry whites and rosés with sea views. Combine with Adonis or Aphrodite trail, Baths of Aphrodite.",
    grapeVarieties: ["Xynisteri", "Muscat of Alexandria", "Vertzami"],
    center: { lat: 34.96, lng: 32.38 },
    winterTip: "Pair a morning hike on the Aphrodite trail with an afternoon tasting in Kathikas—twenty minutes apart.",
    heroImage: "/images/cyprus/cyprus-akamas-coast.jpg",
  },
  {
    slug: "commandaria",
    title: "Commandaria",
    description:
      "Cyprus's oldest wine—sweet, sun-dried. The fourteen UNESCO-named villages: Silikou, Doros, Monagri, Louvaras, Lania, Agios Mamas, and others. Not Omodos or Koilani (Krasochoria, but outside the zone).",
    grapeVarieties: ["Mavro", "Xynisteri"],
    center: { lat: 34.80, lng: 32.95 },
    winterTip: "Commandaria producers welcome drop-ins more readily in winter. Monagri and Lania have the most accessible cellars.",
    heroImage: "/images/cyprus/cyprus-commandaria-village.jpg",
  },
];

export function getWineRouteBySlug(slug: string): WineRoute | undefined {
  return WINE_ROUTES.find((r) => r.slug === slug);
}

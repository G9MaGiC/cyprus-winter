export type WineRoute = {
  slug: string;
  title: string;
  description: string;
};

export const WINE_ROUTES = [
  {
    slug: "krasochoria",
    title: "Krasochoria",
    description:
      "The Limassol wine villages—Omodos, Koilani, Louvaras, Pera Pedi, Pelendri. Mountain views, indigenous varieties, Commandaria-style sweet wines. Call ahead Nov–Mar.",
  },
  {
    slug: "laona",
    title: "Laona",
    description:
      "Paphos hill villages—Panayia, Lemona, Stroumbi, Statos. Cozy tastings, old vines, winter fireside. Distinct from the Commandaria UNESCO zone.",
  },
  {
    slug: "akamas",
    title: "Akamas",
    description:
      "Kathikas and the Akamas peninsula. Dry whites and rosés with sea views. Combine with Adonis or Aphrodite trail, Baths of Aphrodite.",
  },
  {
    slug: "commandaria",
    title: "Commandaria",
    description:
      "Cyprus's oldest wine—sweet, sun-dried. The fourteen UNESCO-named villages: Silikou, Doros, Monagri, Louvaras, Lania, Agios Mamas, and others. Not Omodos or Koilani (Krasochoria, but outside the zone).",
  },
] as const satisfies readonly WineRoute[];

export function getWineRouteBySlug(slug: string): WineRoute | undefined {
  return WINE_ROUTES.find((r) => r.slug === slug);
}

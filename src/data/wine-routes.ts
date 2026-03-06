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
      "The wine villages of Limassol. Omodos, Koilani, Pera Pedi, Pelendri. Mountain views, indigenous varieties, Commandaria.",
  },
  {
    slug: "laona",
    title: "Laona",
    description:
      "Paphos hill villages. Panayia, Lemona, Stroumbi. Cozy tastings, old vines, winter fireside.",
  },
  {
    slug: "akamas",
    title: "Akamas",
    description:
      "Kathikas and the Akamas peninsula. Combine with Adonis Trail, Baths of Aphrodite. Rustic charm.",
  },
  {
    slug: "commandaria",
    title: "Commandaria",
    description:
      "Cyprus's oldest wine. Sweet, sun-dried. Omodos, Pera Pedi, Silikou, Kilani. UNESCO heritage.",
  },
] as const satisfies readonly WineRoute[];

export function getWineRouteBySlug(slug: string): WineRoute | undefined {
  return WINE_ROUTES.find((r) => r.slug === slug);
}

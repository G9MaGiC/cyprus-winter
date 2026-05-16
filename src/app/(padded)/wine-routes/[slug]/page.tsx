import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { notFound } from "next/navigation";
import { wineries } from "@/data/wineries";
import { WINE_ROUTES } from "@/data/wine-routes";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import HubFooter from "@/components/HubFooter";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return WINE_ROUTES.map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = WINE_ROUTES.find((r) => r.slug === slug);
  if (!route)
    return {
      title: "Wine route not found | Cyprus Winter",
      description: "Cyprus winter wine routes: Krasochoria, Laona, Akamas, Commandaria. Browse wineries for winter tastings.",
    };

  const count = wineries.filter((w) => w.wineRoute?.toLowerCase() === slug).length;
  const alternates = buildStrategyAAlternates(`/wine-routes/${slug}`);
  return {
    title: `${route.title} Wine Route Cyprus Winter | Wineries & Tastings`,
    description: `${route.description} ${count} wineries open for winter tastings. Book ahead.`,
    alternates,
  };
}

export default async function WineRoutePage({ params }: Props) {
  const { slug } = await params;
  const route = WINE_ROUTES.find((r) => r.slug === slug);
  if (!route) notFound();
  const [tNav, tPage, tDiscover] = await Promise.all([
    getTranslations("nav"),
    getTranslations("wineRoutes.page"),
    getTranslations("discover"),
  ]);

  const routeWineries = wineries.filter((w) => w.wineRoute?.toLowerCase() === slug);

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/wineries"
        backLabel={tNav("wineries")}
        title={`${route.title} Wine Route`}
        description={route.description}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("wineries"), href: "/wineries" },
          { label: `${route.title} Route`, href: `/wine-routes/${slug}`, isCurrent: true },
        ]}
      />

      <h2 id="wineries-list" className="sr-only">
        Wineries on this route
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {routeWineries.map((w) => (
          <AttractionCard key={w.id} a={w} />
        ))}
      </div>

      <HubFooter
        body={tPage("footer.hubBody")}
        ariaLabel={tPage("aria.actions")}
        askAiLabel={tDiscover("footer.askAi")}
        askAiAriaLabel={tDiscover("aria.askAi")}
        secondary={
          <AppLink href="/wineries" className={SECTION.aegeanLink}>
            {tPage("footer.allWineries")}
          </AppLink>
        }
      />
    </div>
  );
}

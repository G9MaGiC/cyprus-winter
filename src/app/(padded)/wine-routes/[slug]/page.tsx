import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { notFound } from "next/navigation";
import { WINE_ROUTES } from "@/data/wine-routes";
import { wineriesForRoute } from "@/lib/wine-route-stops";
import { localizeWineryContent } from "@/lib/winery-content";
import { applyPartnerOpeningHours } from "@/lib/partner-overlay";
import { HOME, LAYOUT, SECTION, CARD, TYPE } from "@/lib/design-tokens";
import Image from "next/image";
import HubFooter from "@/components/HubFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import { getTranslations } from "next-intl/server";
import WineRouteMap from "./WineRouteMapClient";
import WineRouteBookableStops from "./WineRouteBookableStops";
import { toAbsoluteUrl } from "@/lib/site-url";
import { WINE_ROUTE_BOOK_FROM } from "@/lib/wine-route-stops";

export function generateStaticParams() {
  return WINE_ROUTES.map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = WINE_ROUTES.find((r) => r.slug === slug);
  const t = await getTranslations("wineRoutes.page");
  if (!route) notFound();

  const count = wineriesForRoute(slug).length;
  const alternates = buildStrategyAAlternates(`/wine-routes/${slug}`);
  const ogImage = toAbsoluteUrl(route.heroImage || "/images/cyprus/cyprus-village-omodos.jpg");
  return {
    title: t("meta.title", { route: route.title }),
    description: t("meta.description", { route: route.title, count }),
    alternates,
    openGraph: {
      title: t("meta.title", { route: route.title }),
      description: t("meta.description", { route: route.title, count }),
      url: alternates.canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("routeTitle", { route: route.title }) }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title", { route: route.title }),
      description: t("meta.description", { route: route.title, count }),
      images: [ogImage],
    },
  };
}

export default async function WineRoutePage({ params }: Props) {
  const { slug } = await params;
  const route = WINE_ROUTES.find((r) => r.slug === slug);
  if (!route) notFound();
  const [tNav, tCommon, tPage, tDiscover] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("wineRoutes.page"),
    getTranslations("discover"),
  ]);

  const routeWineries = await Promise.all(
    wineriesForRoute(slug).map(async (w) => applyPartnerOpeningHours(await localizeWineryContent(w)))
  );

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/wine-routes"
        backLabel={tCommon("breadcrumbs.wineRoutes")}
        title={tPage("routeTitle", { route: route.title })}
        description={route.description}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("wineries"), href: "/wineries" },
          { label: tCommon("breadcrumbs.wineRoutes"), href: "/wine-routes" },
          { label: tPage("routeBreadcrumb", { route: route.title }), href: `/wine-routes/${slug}`, isCurrent: true },
        ]}
      />

      {route.heroImage && (
        <div className="relative rounded-2xl overflow-hidden aspect-[21/9] mb-8">
          <Image
            src={route.heroImage}
            alt={tPage("routeTitle", { route: route.title })}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
          <div className={CARD.heroOverlay} aria-hidden />
        </div>
      )}

      <WineRouteMap routeTitle={route.title} center={route.center} wineries={routeWineries} />

      {route.grapeVarieties.length > 0 && (
        <div className="mb-8">
          <h2 className={`${TYPE.kicker} text-muted-ink mb-3`}>{tPage("grapeVarieties")}</h2>
          <div className="flex flex-wrap gap-2">
            {route.grapeVarieties.map((grape) => (
              <span key={grape} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-sand-100 text-muted-ink border border-sand-200/70">{grape}</span>
            ))}
          </div>
        </div>
      )}

      {route.winterTip && (
        <div className={`${CARD.base} ${CARD.content} border-s-4 border-s-golden/30 mb-8`}>
          <p className={`${TYPE.kicker} text-golden-ink mb-1`}>{tPage("winterTipLabel")}</p>
          <p className="text-sm text-olive/90 leading-relaxed">{route.winterTip}</p>
        </div>
      )}

      <WineRouteBookableStops slug={slug} />

      <div id="wine-route-plan-sentinel" className="h-px pointer-events-none mb-8" aria-hidden />

      <h2 id="wineries-list" className="sr-only">
        {tPage("wineriesOnRoute")}
      </h2>
      <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
        {routeWineries.map((w) => (
          <AttractionCard key={w.id} a={w} bookFrom={WINE_ROUTE_BOOK_FROM} />
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
      <StickyPlanBarBlock sentinelId="wine-route-plan-sentinel" />
    </div>
  );
}

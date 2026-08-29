import type { Metadata } from "next";
import Image from "next/image";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { WINE_ROUTES } from "@/data/wine-routes";
import { HOME, LAYOUT, CTA, TYPE, SECTION, CARD } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import HubFooter from "@/components/HubFooter";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-winery-troodos.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "wineRoutes.hub" });
  const title = t("meta.title");
  const description = t("meta.description");
  const alternates = buildStrategyAAlternates("/wine-routes");
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description: t("meta.ogDescription"),
      url: alternates.canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("meta.ogAlt") }],
    },
  };
}

export default async function WineRoutesHubPage() {
  const [tNav, tCommon, tHub, tDiscover] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("wineRoutes.hub"),
    getTranslations("discover"),
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tHub("meta.schemaName"),
    description: tHub("meta.schemaDescription"),
    url: `${SITE_URL}/wine-routes`,
    numberOfItems: WINE_ROUTES.length,
    itemListElement: WINE_ROUTES.map((route, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristTrip",
        name: route.title,
        description: route.description.slice(0, 160),
        url: `${SITE_URL}/wine-routes/${route.slug}`,
      },
    })),
  };

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(itemListSchema) }}
      />
      <PageHeader
        backHref="/wineries"
        backLabel={tNav("wineries")}
        title={tHub("header.title")}
        description={tHub("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("wineries"), href: "/wineries" },
          { label: tCommon("breadcrumbs.wineRoutes"), href: "/wine-routes", isCurrent: true },
        ]}
      >
        <div className="mt-4 flex flex-wrap gap-3">
          <AppLink href="/wineries" className={CTA.secondaryCompact}>
            {tHub("footer.allWineries")}
          </AppLink>
          <AppLink href="/plan" className={CTA.primaryCompact}>
            {tNav("plan")}
          </AppLink>
        </div>
      </PageHeader>

      <ul className={`grid sm:grid-cols-2 ${HOME.gridGap} mb-12 sm:mb-16`}>
        {WINE_ROUTES.map((route) => (
          <li key={route.slug}>
            <AppLink
              href={`/wine-routes/${route.slug}`}
              className={`${CARD.base} ${CARD.hover} ${CARD.link} block overflow-hidden h-full`}
            >
              <div className="relative aspect-[16/9] bg-sand-100">
                <Image
                  src={route.heroImage}
                  alt={route.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className={CARD.content}>
                <h2 className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>{route.title}</h2>
                <p className="text-sm text-muted-ink leading-relaxed line-clamp-3">{route.description}</p>
                {route.winterTip && (
                  <p className="mt-3 text-xs text-muted-ink">
                    <span className="font-medium text-muted-ink">{tHub("winterTipLabel")}: </span>
                    {route.winterTip}
                  </p>
                )}
                <span className={`${SECTION.aegeanLink} inline-block mt-4 text-sm font-medium`}>
                  {tHub("ctaOpen")}
                </span>
              </div>
            </AppLink>
          </li>
        ))}
      </ul>

      <span id="wine-routes-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <HubFooter
        body={tHub("footer.hubBody")}
        ariaLabel={tHub("aria.actions")}
        askAiLabel={tDiscover("footer.askAi")}
        askAiAriaLabel={tDiscover("aria.askAi")}
        secondary={
          <AppLink href="/wineries" className={SECTION.aegeanLink}>
            {tHub("footer.allWineries")}
          </AppLink>
        }
      />
      <StickyPlanBarBlock sentinelId="wine-routes-plan-sentinel" />
    </div>
  );
}

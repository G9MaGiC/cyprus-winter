import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import AppLink from "@/components/AppLink";
import { wineries } from "@/data/wineries";
import { LAYOUT, CTA, CARD, HOME, TYPE, SECTION, MEDIA, BADGE } from "@/lib/design-tokens";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookWineryHubFooter from "@/components/BookWineryHubFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getTranslations } from "next-intl/server";
import { getAttractionImage } from "@/lib/cyprus-images";
import { isPartnerVerified } from "@/lib/partner-verification";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("book.pages.wineryList.meta");
  const alternates = buildStrategyAAlternates("/book/winery");
  return {
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternates.canonical,
      type: "website",
    },
  };
}

export default async function WineriesListPage() {
  const [tNav, tCommon, tBookPages] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("book.pages"),
  ]);
  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className={`flex flex-col gap-1 ${SECTION.headingGap}`} aria-label={tBookPages("pageNavAria")}>
        <BackLink href="/wineries" label={tCommon("backTo", { label: tNav("wineries") })} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("wineries"), href: "/wineries" },
            { label: tCommon("breadcrumbs.bookTasting"), href: "/book/winery", isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-muted-ink"
        />
      </nav>

      <div className={SECTION.headingMargin}>
        <h1 className={`${TYPE.pageTitle} ${SECTION.headingGap}`}>{tCommon("breadcrumbs.bookTasting")}</h1>
        <p className="text-muted-ink max-w-2xl">
          {tBookPages("wineryList.intro")}
        </p>
        <p className="text-sm text-muted-ink mt-2 max-w-2xl">
          {tBookPages("wineryList.disclaimer")}
        </p>
        <p className="text-sm text-muted-ink mt-3 max-w-2xl">
          <AppLink href="/book/guide" className={SECTION.aegeanLink}>
            {tBookPages("wineryList.alsoGuides")}
          </AppLink>
        </p>
      </div>

      <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
        {(() => {
          const sorted = [...wineries].sort((a, b) => {
            if (isPartnerVerified(a) && !isPartnerVerified(b)) return -1;
            if (!isPartnerVerified(a) && isPartnerVerified(b)) return 1;
            return 0;
          });

          const regionGroups = new Map<string, typeof wineries>();
          for (const w of sorted) {
            const group = regionGroups.get(w.region) ?? [];
            group.push(w);
            regionGroups.set(w.region, group);
          }

          return Array.from(regionGroups.entries()).map(([region, group], gi) => (
            <Fragment key={region}>
              <h2 className={`text-lg font-semibold text-olive col-span-full ${gi === 0 ? "mt-0" : "mt-6"}`}>{region}</h2>
              {group.map((winery) => (
                <div
                  key={winery.id}
                  className={`overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.interactive} group flex flex-col`}
                >
                  <div className={CARD.media}>
                    <Image
                      src={getAttractionImage(winery.id, "winery")}
                      alt={winery.name}
                      fill
                      className={MEDIA.hoverImage}
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className={CARD.mediaOverlayLight} aria-hidden />
                  </div>
                  <div className={`${CARD.content} flex flex-col flex-1`}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`${BADGE.base} ${BADGE.pill} bg-aegean/20 text-aegean`}>
                      {tCommon("wineTasting")}
                    </span>
                    {isPartnerVerified(winery) && (
                      <span className={`${BADGE.base} ${BADGE.pill} bg-aegean/20 text-aegean`}>
                        {tCommon("verifiedPartner")}
                      </span>
                    )}
                  </div>
                  <h3 className={`${TYPE.cardTitle} mb-1`}>{winery.name}</h3>
                  <p className="text-sm text-muted-ink mb-2">{winery.region}</p>
                  {winery.tastingInfo && (
                    <p className="text-sm text-muted-ink mb-4 flex-1 line-clamp-2">{winery.tastingInfo}</p>
                  )}
                  {winery.bestFor.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {winery.bestFor.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-sand-200/80 text-muted-ink"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <AppLink
                    href={`/book/winery/${winery.id}?from=book`}
                    className={`w-full justify-center ${CTA.primaryCompact}`}
                    aria-label={tBookPages("wineryList.ctaAria", { name: winery.name })}
                  >
                    {tCommon("bookTasting")}
                  </AppLink>
                  </div>
                </div>
              ))}
            </Fragment>
          ));
        })()}
      </div>

      <span id="book-winery-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <BookWineryHubFooter />
      <StickyPlanBarBlock sentinelId="book-winery-plan-sentinel" />
    </div>
  );
}

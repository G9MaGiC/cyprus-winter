import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import AppLink from "@/components/AppLink";
import { wineries } from "@/data/wineries";
import { LAYOUT, CTA, CARD, TYPE, SECTION } from "@/lib/design-tokens";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";

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
  const [tNav, tCommon, tBookings, tBookPages] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("bookings"),
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
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <div className={SECTION.headingMargin}>
        <h1 className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>{tCommon("breadcrumbs.bookTasting")}</h1>
        <p className="text-olive/70 max-w-2xl">
          {tBookPages("wineryList.intro")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(() => {
          const sorted = [...wineries].sort((a, b) => {
            if (a.isVerified && !b.isVerified) return -1;
            if (!a.isVerified && b.isVerified) return 1;
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
                  className={`${CARD.base} ${CARD.content} ${CARD.hover} rounded-xl overflow-hidden flex flex-col`}
                >
                  <div className="relative h-32 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-3">
                    <Image src={winery.image} alt={winery.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean">
                      {tCommon("wineTasting")}
                    </span>
                    {winery.isVerified && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean">
                        {tCommon("verifiedPartner")}
                      </span>
                    )}
                  </div>
                  <h3 className={`${TYPE.cardTitle} mb-1`}>{winery.name}</h3>
                  <p className="text-sm text-olive/70 mb-2">{winery.region}</p>
                  {winery.tastingInfo && (
                    <p className="text-sm text-olive/80 mb-4 flex-1 line-clamp-2">{winery.tastingInfo}</p>
                  )}
                  {winery.bestFor.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {winery.bestFor.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-sand-200/80 text-olive/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <AppLink
                    href={`/book/winery/${winery.id}`}
                    className={`w-full justify-center ${CTA.primaryCompact}`}
                    aria-label={tBookPages("wineryList.ctaAria", { name: winery.name })}
                  >
                    {tCommon("bookTasting")}
                  </AppLink>
                </div>
              ))}
            </Fragment>
          ));
        })()}
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm">
        <AppLink href="/wineries" className={SECTION.aegeanLink}>
          {tBookPages("wineryList.footerBrowseWineries")}
        </AppLink>
        {" · "}
        <AppLink href="/bookings" className={SECTION.aegeanLink}>
          {tBookings("title")}
        </AppLink>
      </p>
    </div>
  );
}

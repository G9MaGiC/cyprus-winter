import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { wineries } from "@/data/wineries";
import { LAYOUT, CTA, TYPE, SECTION } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import WineriesHubFooter from "@/components/WineriesHubFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-winery-troodos.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "wineries.page" });
  const title = t("meta.title");
  const description = t("meta.description");

  const alternates = buildStrategyAAlternates("/wineries");
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

export default async function WineriesPage() {
  const [tNav, tCommon, tHome, tWineries] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("home"),
    getTranslations("wineries.page"),
  ]);

  const wineriesItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tWineries("meta.schemaName"),
    description: tWineries("meta.schemaDescription"),
    url: `${SITE_URL}/wineries`,
    numberOfItems: wineries.length,
    itemListElement: wineries.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Winery",
        name: item.name,
        description: item.description.slice(0, 160),
        url: `${SITE_URL}/discover/${item.id}`,
        address: { "@type": "PostalAddress", addressLocality: item.region, addressCountry: "CY" },
      },
    })),
  };

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(wineriesItemListSchema) }} />
      <PageHeader
        backHref="/discover"
        backLabel={tNav("discover")}
        title={tWineries("header.title")}
        description={tWineries("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("discover"), href: "/discover" },
          { label: tNav("wineries"), href: "/wineries", isCurrent: true },
        ]}
      >
        <div className="mt-4 flex flex-wrap gap-3">
          <AppLink href="/bookings" className={CTA.primaryCompact}>
            {tCommon("bookTasting")}
          </AppLink>
          <AppLink href="/plan" className={CTA.secondaryCompact} aria-label={tHome("aria.plan")}>
            {tCommon("planYourTrip")}
          </AppLink>
        </div>
      </PageHeader>

      {(() => {
        const partners = wineries.filter((w) => w.isVerified);
        return partners.length > 0 ? (
          <section aria-labelledby="partners-heading" className="mb-12 sm:mb-16">
            <h2 id="partners-heading" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
              {tWineries("partners.title")}
            </h2>
            <p className="text-olive/70 text-sm mb-6 max-w-2xl">
              {tWineries("partners.body")}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((winery) => (
                <AttractionCard key={winery.id} a={winery} bookFrom="wineries" />
              ))}
            </div>
          </section>
        ) : null;
      })()}

      <div id="wineries-plan-sentinel" className="h-px pointer-events-none" aria-hidden />

      <h2 id="wineries-list" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
        {tWineries("listTitle")}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wineries.map((winery) => (
          <AttractionCard key={winery.id} a={winery} bookFrom="wineries" />
        ))}
      </div>

      <WineriesHubFooter />
      <StickyPlanBarBlock sentinelId="wineries-plan-sentinel" />
    </div>
  );
}

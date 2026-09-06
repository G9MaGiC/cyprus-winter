import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { villages } from "@/data/attractions";
import { HOME, LAYOUT, CTA } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import { localizeDiscoverContent } from "@/lib/discover-content";
import HubRegionFilter, { type HubFilterGroup } from "@/components/HubRegionFilter";
import PageHeader from "@/components/PageHeader";
import HubFooter from "@/components/HubFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "villages.page" });
  const title = t("meta.title");
  const description = t("meta.description");

  const alternates = buildStrategyAAlternates("/villages");
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

export default async function VillagesPage() {
  const [tNav, tCommon, tVillages, tDiscover] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("villages.page"),
    getTranslations("discover"),
  ]);

  // AUD-10 overlay for the card grid (id-gated no-op off coverage); the
  // JSON-LD below keeps reading the EN base per the register contract.
  const localizedVillages = await Promise.all(villages.map((v) => localizeDiscoverContent(v)));
  const villagesItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tVillages("meta.schemaName"),
    description: tVillages("meta.schemaDescription"),
    url: `${SITE_URL}/villages`,
    numberOfItems: villages.length,
    itemListElement: villages.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: item.name,
        description: item.description.slice(0, 160),
        url: `${SITE_URL}/discover/${item.id}`,
        address: { "@type": "PostalAddress", addressLocality: item.region, addressCountry: "CY" },
      },
    })),
  };

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(villagesItemListSchema) }} />
      <PageHeader
        backHref="/discover"
        backLabel={tNav("discover")}
        title={tVillages("header.title")}
        description={tVillages("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("discover"), href: "/discover" },
          { label: tNav("villages"), href: "/villages", isCurrent: true },
        ]}
      >
        <AppLink href="/plan" className={`mt-4 ${CTA.primaryCompact}`}>
          {tCommon("planYourTrip")}
        </AppLink>
      </PageHeader>

      <section aria-labelledby="villages-list">
        <h2 id="villages-list" className="sr-only">
          {tVillages("srHeading")}
        </h2>
        {/* Region facets over the ~30k-px flat scroll (AUD-68). */}
        {(() => {
          const counts = new Map<string, number>();
          for (const v of villages) counts.set(v.region, (counts.get(v.region) ?? 0) + 1);
          const groups: HubFilterGroup[] = [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([value, count]) => ({ value, label: value, count }));
          return <HubRegionFilter containerId="villages-grid" groups={groups} total={villages.length} />;
        })()}
        <ul id="villages-grid" role="list" className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
          {localizedVillages.map((village) => (
            <li key={village.id} data-hub-group={village.region}><AttractionCard a={village} /></li>
          ))}
        </ul>
      </section>

      <span id="villages-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <HubFooter
        body={tVillages("footer.hubBody")}
        ariaLabel={tVillages("aria.actions")}
        askAiLabel={tDiscover("footer.askAi")}
        askAiAriaLabel={tDiscover("aria.askAi")}
      />
      <StickyPlanBarBlock sentinelId="villages-plan-sentinel" />
    </div>
  );
}

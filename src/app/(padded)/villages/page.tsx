import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { villages } from "@/data/attractions";
import { LAYOUT, CTA } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
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
        <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {villages.map((village) => (
            <li key={village.id}><AttractionCard a={village} /></li>
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

import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { beaches } from "@/data/attractions";
import { LAYOUT, SECTION, CTA } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-beach-nissi.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "beaches.page" });
  const title = t("meta.title");
  const description = t("meta.description");
  const alternates = buildStrategyAAlternates("/beaches");
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description: t("meta.schemaDescription"),
      url: alternates.canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("meta.ogAlt") }],
    },
  };
}

export default async function BeachesPage() {
  const [tNav, tCommon, tBeaches] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("beaches.page"),
  ]);
  const beachesItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tBeaches("meta.schemaName"),
    description: tBeaches("meta.schemaDescription"),
    url: `${SITE_URL}/beaches`,
    numberOfItems: beaches.length,
    itemListElement: beaches.map((item, i) => ({
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(beachesItemListSchema) }} />
      <PageHeader
        backHref="/discover"
        backLabel={tNav("discover")}
        title={tBeaches("header.title")}
        description={tBeaches("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("discover"), href: "/discover" },
          { label: tNav("beaches"), href: "/beaches", isCurrent: true },
        ]}
      >
        <AppLink href="/plan" className={`mt-4 inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}>
          {tCommon("planYourTrip")}
        </AppLink>
      </PageHeader>

      <h2 id="beaches-list" className="sr-only">
        {tBeaches("srHeading")}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {beaches.map((beach) => (
          <AttractionCard key={beach.id} a={beach} />
        ))}
      </div>

      <div className={`${SECTION.footerBlock} relative`}>
        <span id="beaches-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        <p className="text-center text-olive/70 text-sm max-w-md mx-auto">
        {tBeaches("footer.body")}{" "}
        <AppLink href="/discover" className={SECTION.aegeanLink}>
          {tBeaches("footer.allPlaces")}
        </AppLink>
        {" · "}
        <AppLink href="/plan" className={SECTION.aegeanLink}>
          {tBeaches("footer.planDay")}
        </AppLink>
      </p>
      </div>
      <StickyPlanBarBlock sentinelId="beaches-plan-sentinel" />
    </div>
  );
}

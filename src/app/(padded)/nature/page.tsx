import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import NatureExcursionsSection from "@/components/nature/NatureExcursionsSection";
import NatureCrosslinksStrip from "@/components/nature/NatureCrosslinksStrip";
import NatureFooter from "@/app/(padded)/nature/NatureFooter";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { natureExcursions } from "@/data/nature-excursions";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { SITE_URL } from "@/lib/site-url";
import { LAYOUT, CTA } from "@/lib/design-tokens";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-trail-waterfall.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "nature.page" });
  const alternates = buildStrategyAAlternates("/nature");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates,
    openGraph: {
      title: t("meta.title"),
      description: t("meta.schemaDescription"),
      url: alternates.canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("meta.ogAlt") }],
    },
  };
}

export default async function NaturePage() {
  const [tNav, tCommon, tNature] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("nature.page"),
  ]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tNature("meta.schemaName"),
    description: tNature("meta.schemaDescription"),
    url: `${SITE_URL}/nature`,
    numberOfItems: natureExcursions.length,
    itemListElement: natureExcursions.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: item.name,
        description: item.description.slice(0, 160),
        url: item.visitCyprusUrl,
      },
    })),
  };

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(schema) }} />
      <PageHeader
        backHref="/discover"
        backLabel={tNav("discover")}
        title={tNature("header.title")}
        description={tNature("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("discover"), href: "/discover" },
          { label: tNav("nature"), href: "/nature", isCurrent: true },
        ]}
      >
        <AppLink href="/plan" className={`mt-4 ${CTA.primaryCompact}`}>
          {tCommon("planYourTrip")}
        </AppLink>
      </PageHeader>

      <NatureExcursionsSection />
      <NatureCrosslinksStrip />

      <span id="nature-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <NatureFooter />
      <StickyPlanBarBlock sentinelId="nature-plan-sentinel" />
    </div>
  );
}

import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { getCyclingHubContent } from "@/lib/cycling-hub";
import CyclingOfficialRoutes from "@/components/cycling/CyclingOfficialRoutes";
import { HOME, LAYOUT, CTA, TYPE, SECTION } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import CyclingFooter from "@/app/(padded)/cycling/CyclingFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-trail-troodos.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "cycling.page" });
  const title = t("meta.title");
  const description = t("meta.description");
  const alternates = buildStrategyAAlternates("/cycling");
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

export default async function CyclingPage() {
  const [tNav, tCommon, tCycling] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("cycling.page"),
  ]);
  const { places, trailLinks } = getCyclingHubContent();
  const cyclingItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tCycling("meta.schemaName"),
    description: tCycling("meta.schemaDescription"),
    url: `${SITE_URL}/cycling`,
    numberOfItems: places.length,
    itemListElement: places.map((item, i) => ({
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(cyclingItemListSchema) }} />
      <PageHeader
        backHref="/discover"
        backLabel={tNav("discover")}
        title={tCycling("header.title")}
        description={tCycling("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("discover"), href: "/discover" },
          { label: tNav("cycling"), href: "/cycling", isCurrent: true },
        ]}
      >
        <AppLink href="/plan" className={`mt-4 ${CTA.primaryCompact}`}>
          {tCommon("planYourTrip")}
        </AppLink>
      </PageHeader>

      <section aria-labelledby="cycling-list">
        <h2 id="cycling-list" className="sr-only">
          {tCycling("srHeading")}
        </h2>
        <ul role="list" className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
          {places.map((place) => (
            <li key={place.id}>
              <AttractionCard a={place} />
            </li>
          ))}
        </ul>
      </section>

      {trailLinks.length > 0 && (
        <section aria-labelledby="cycling-trails" className="mt-12 sm:mt-16">
          <h2 id="cycling-trails" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
            {tCycling("trailsTitle")}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {trailLinks.map((trail) => (
              <li key={trail.id}>
                <AppLink href={trail.href} className={CTA.secondaryCompact}>
                  {trail.name}
                </AppLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CyclingOfficialRoutes />

      <span id="cycling-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <CyclingFooter />
      <StickyPlanBarBlock sentinelId="cycling-plan-sentinel" />
    </div>
  );
}

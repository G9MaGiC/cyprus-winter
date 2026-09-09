import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { beaches } from "@/data/attractions";
import { HOME, LAYOUT, CTA } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import { localizeDiscoverContent } from "@/lib/discover-content";
import PageHeader from "@/components/PageHeader";
import HubFooter from "@/components/HubFooter";
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
  const tDiscover = await getTranslations("discover");
  // AUD-10 overlay for the card grid (id-gated no-op off coverage); the
  // JSON-LD below keeps reading the EN base per the register contract.
  const localizedBeaches = await Promise.all(beaches.map((b) => localizeDiscoverContent(b)));
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
        <AppLink href="/plan" className={`mt-4 ${CTA.primaryCompact}`}>
          {tCommon("planYourTrip")}
        </AppLink>
      </PageHeader>

      <section aria-labelledby="beaches-list">
        <h2 id="beaches-list" className="sr-only">
          {tBeaches("srHeading")}
        </h2>
        <ul role="list" className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
          {localizedBeaches.map((beach) => (
            <li key={beach.id}><AttractionCard a={beach} /></li>
          ))}
        </ul>
      </section>

      <span id="beaches-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <HubFooter
        body={tBeaches("footer.hubBody")}
        ariaLabel={tBeaches("aria.actions")}
        askAiLabel={tDiscover("footer.askAi")}
        askAiAriaLabel={tDiscover("aria.askAi")}
      />
      <StickyPlanBarBlock sentinelId="beaches-plan-sentinel" />
    </div>
  );
}

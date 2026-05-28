import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { allDiscoverItems } from "@/data/discover";
import { buildDiscoverSections } from "@/lib/discover-sections";
import {
  ACTIVITY_FILTER_KEYS,
  buildActivitySection,
  isActivityFilterKey,
} from "@/lib/activity-catalog";
import { buildDiscoverPageSchema } from "@/lib/discover-schema";
import {
  absoluteDiscoverPageUrl,
  discoverSectionMetaKey,
} from "@/lib/discover-list-meta";
import { buildDiscoverListMetadata } from "@/lib/discover-list-meta";
import { CTA, LAYOUT } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import SearchBar from "@/components/SearchBar";
import DiscoverClient from "./DiscoverClient";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const standardSections = buildDiscoverSections(allDiscoverItems);
const activitySections = ACTIVITY_FILTER_KEYS.map((key) =>
  buildActivitySection(key, allDiscoverItems)
).filter((s): s is NonNullable<typeof s> => s != null);

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string | string[] }>;
}) {
  const locale = await getLocale();
  const resolvedParams = searchParams ? await searchParams : {};
  return buildDiscoverListMetadata(locale, resolvedParams.filter);
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string | string[] }>;
}) {
  const locale = await getLocale();
  const resolvedParams = searchParams ? await searchParams : {};
  const filterParam =
    typeof resolvedParams.filter === "string"
      ? resolvedParams.filter
      : Array.isArray(resolvedParams.filter)
        ? resolvedParams.filter[0]
        : undefined;

  const [tNav, tCommon, tDiscover, tMeta] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("discover"),
    getTranslations("discover.page.meta"),
  ]);

  const pageUrl = absoluteDiscoverPageUrl(filterParam, locale);
  let schemaTitle = tMeta("title");
  let schemaDescription = tMeta("description");
  let filterBreadcrumbLabel: string | null = null;

  if (filterParam && isActivityFilterKey(filterParam)) {
    schemaTitle = tMeta(`filters.${filterParam}.title`);
    schemaDescription = tMeta(`filters.${filterParam}.description`);
    filterBreadcrumbLabel = tDiscover(`page.filters.${filterParam}`);
  } else if (filterParam) {
    const sectionMetaKey = discoverSectionMetaKey(filterParam);
    if (sectionMetaKey) {
      schemaTitle = tMeta(`filters.${sectionMetaKey}.title`);
      schemaDescription = tMeta(`filters.${sectionMetaKey}.description`);
      filterBreadcrumbLabel =
        sectionMetaKey === "nature"
          ? tDiscover("page.filters.natureAndCoasts")
          : tDiscover(`page.sections.${sectionMetaKey}`);
    }
  }

  const discoverSchema = buildDiscoverPageSchema({
    items: allDiscoverItems,
    siteUrl: SITE_URL,
    pageUrl,
    name: schemaTitle,
    description: schemaDescription,
    breadcrumbs: [
      { name: tNav("home"), url: `${SITE_URL}/` },
      { name: tNav("discover"), url: absoluteDiscoverPageUrl(undefined, locale) },
      ...(filterBreadcrumbLabel
        ? [{ name: filterBreadcrumbLabel, url: pageUrl }]
        : []),
    ],
  });

  return (
    <div className="min-h-screen bg-sand">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(discoverSchema) }}
      />
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col gap-12 sm:gap-16 md:gap-20`}>
        <ListPageHero
          backHref="/"
          backLabel={tNav("home")}
          title={tDiscover("page.hero.title")}
          description={tDiscover("page.hero.description")}
          backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
          backgroundImageAlt={tDiscover("page.hero.imageAlt")}
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("discover"), href: "/discover", isCurrent: true }]}
        >
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
            <AppLink
              href="#discover-content"
              className={`${CTA.primaryCompact} w-full sm:w-auto text-center`}
              aria-label={tDiscover("page.hero.browseAria")}
            >
              {tDiscover("page.hero.browsePlaces")}
            </AppLink>
            <AppLink
              href="/plan"
              className={`${CTA.secondaryCompact} w-full sm:w-auto text-center`}
              aria-label={tDiscover("page.hero.planAria")}
            >
              {tCommon("planYourTrip")}
            </AppLink>
          </div>
        </ListPageHero>

        <search
          aria-labelledby="discover-search-heading"
          className="-mt-4"
        >
          <div className={`${LAYOUT.list} mx-auto`}>
            <h2 id="discover-search-heading" className="sr-only">
              {tDiscover("page.search.srHeading")}
            </h2>
            <SearchBar
              placeholder={tDiscover("page.search.placeholder")}
              className="max-w-2xl mx-auto"
            />
          </div>
        </search>

        <div id="discover-plan-sentinel" className="h-px pointer-events-none" aria-hidden />

        <DiscoverClient
          sections={standardSections}
          activitySections={activitySections}
        />
      </div>
    </div>
  );
}

import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { allDiscoverItems, type DiscoverItem } from "@/data/discover";
import { buildDiscoverSections, toDiscoverCardSection } from "@/lib/discover-sections";
import { localizeDiscoverContent } from "@/lib/discover-content";
import { applyPartnerOpeningHours } from "@/lib/partner-overlay";
import HubSkipNav from "@/components/HubSkipNav";
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
import { CTA, HUB, LAYOUT } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import SearchBar from "@/components/SearchBar";
import DiscoverClient from "./DiscoverClient";
import DiscoverCombosTeaser from "./DiscoverCombosTeaser";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

const DISCOVER_HERO_IMAGE = "/images/cyprus/cyprus-village-omodos.jpg";

// Winery items get the AUD-10 locale overlay + live partner hours (in that
// precedence order) before projection, so sections are built per request —
// the page is already request-rendered (root layout resolves the locale per
// request), and the section filters are cheap in-memory passes.
async function localizeItems(items: DiscoverItem[]): Promise<DiscoverItem[]> {
  return Promise.all(
    items.map(async (item) => {
      // Covered wineries AND pilot attractions localize (id-gated inside);
      // live partner hours still apply to winery records only, after the
      // overlay (precedence contract).
      const localized = await localizeDiscoverContent(item);
      return item.type === "winery" ? applyPartnerOpeningHours(localized) : localized;
    })
  );
}

// Lean-project items at the client boundary: DiscoverClient serializes its
// props into the RSC flight payload, so it gets DiscoverCardItem, not the
// full catalog objects (~319KB -> ~136KB of item JSON).
async function buildCardSections() {
  const standardSections = await Promise.all(
    buildDiscoverSections(allDiscoverItems).map(async (s) =>
      toDiscoverCardSection({ ...s, items: await localizeItems(s.items) })
    )
  );
  const activitySections = await Promise.all(
    ACTIVITY_FILTER_KEYS.map((key) => buildActivitySection(key, allDiscoverItems))
      .filter((s): s is NonNullable<typeof s> => s != null)
      .map(async (s) => toDiscoverCardSection({ ...s, items: await localizeItems(s.items) }))
  );
  return { standardSections, activitySections };
}

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
  const { standardSections, activitySections } = await buildCardSections();
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
      <HubSkipNav targets={[{ href: "#discover-content", labelKey: "results" }]} />
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col ${HUB.shellGap}`}>
        <ListPageHero
          backHref="/"
          backLabel={tNav("home")}
          title={tDiscover("page.hero.title")}
          description={tDiscover("page.hero.description")}
          backgroundImage={DISCOVER_HERO_IMAGE}
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

        <DiscoverCombosTeaser />

        <DiscoverClient
          sections={standardSections}
          activitySections={activitySections}
        />
      </div>
    </div>
  );
}

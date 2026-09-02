import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { guides } from "@/data/guides";
import GuidePartnerMeta from "@/components/guides/GuidePartnerMeta";
import { LAYOUT, CTA, CARD, HOME, TYPE, SECTION, BADGE } from "@/lib/design-tokens";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";
import BookGuideHubFooter from "@/components/BookGuideHubFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getTranslations } from "next-intl/server";
import { isPartnerVerified } from "@/lib/partner-verification";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("book.pages.guideList.meta");
  const alternates = buildStrategyAAlternates("/book/guide");
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

function getTrailNames(guide: (typeof guides)[0]): string[] {
  return guide.trailIds
    .map((tid) => findTrailByIdOrSlug(tid))
    .filter((t): t is NonNullable<typeof t> => t != null)
    .map((t) => t.name);
}

export default async function GuidesListPage() {
  const publicGuides = guides.filter((guide) => guide.isPublic !== false);
  const [tNav, tCommon, tBookPages, tGuidesDir] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("book.pages"),
    getTranslations("guides.directory"),
  ]);
  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className={`flex flex-col gap-1 ${SECTION.headingGap}`} aria-label={tBookPages("pageNavAria")}>
        <BackLink href="/trails" label={tCommon("backTo", { label: tNav("trails") })} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("trails"), href: "/trails" },
            { label: tCommon("breadcrumbs.bookGuide"), href: "/book/guide", isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-muted-ink"
        />
      </nav>

      <div className={SECTION.headingMargin}>
        <h1 className={`${TYPE.pageTitle} ${SECTION.headingGap}`}>{tCommon("breadcrumbs.bookGuide")}</h1>
        <p className="text-muted-ink max-w-2xl">
          {tBookPages("guideList.intro")}
        </p>
        {publicGuides.some((g) => isPartnerVerified(g)) && (
          <p className="text-sm text-muted-ink mt-2 max-w-2xl">
            {tBookPages("guideList.partnerCount", { count: publicGuides.filter((g) => isPartnerVerified(g)).length })}
          </p>
        )}
        <p className="text-sm text-muted-ink mt-3 max-w-2xl">
          <AppLink href="/guides/directory" className={SECTION.aegeanLink}>
            {tBookPages("guideList.browseLicensedDirectory")}
          </AppLink>
        </p>
        <p className="text-sm text-muted-ink mt-3 max-w-2xl">
          <AppLink href="/book/winery" className={SECTION.aegeanLink}>
            {tBookPages("guideList.alsoWineries")}
          </AppLink>
        </p>
      </div>

      <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
        {publicGuides.map((guide) => {
          const trailNames = getTrailNames(guide);
          return (
            <div
              key={guide.id}
              className={`${CARD.base} ${CARD.content} ${CARD.hover} ${CARD.interactive} flex flex-col`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`${BADGE.base} ${BADGE.pill} bg-aegean/20 text-aegean`}>
                  {tCommon("guidedHike")}
                </span>
                {isPartnerVerified(guide) && (
                  <span className={`${BADGE.base} ${BADGE.pill} bg-aegean/20 text-aegean`}>
                    {tCommon("verifiedPartner")}
                  </span>
                )}
              </div>
              <h2 className={`${TYPE.cardTitle} mb-1`}>{guide.name}</h2>
              <p className="text-sm text-muted-ink mb-2">{guide.region}</p>
              <GuidePartnerMeta
                guide={guide}
                districtLabel={tGuidesDir(`districts.${guide.district}`)}
              />
              <p className="text-sm text-muted-ink mb-4 flex-1 line-clamp-3">{guide.description}</p>
              {trailNames.length > 0 && (
                <p className="text-xs text-muted-ink mb-4">
                  {tBookPages("guideList.trailsPrefix")} {trailNames.slice(0, 4).join(", ")}
                  {trailNames.length > 4 ? ` ${tBookPages("guideList.moreCount", { count: trailNames.length - 4 })}` : ""}
                </p>
              )}
              <AppLink
                href={`/book/guide/${guide.id}`}
                className={`w-full justify-center ${CTA.primaryCompact}`}
                aria-label={tBookPages("guideList.ctaAria", { name: guide.name })}
              >
                {tCommon("bookHike")}
              </AppLink>
            </div>
          );
        })}
      </div>

      <span id="book-guide-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <BookGuideHubFooter />
      <StickyPlanBarBlock sentinelId="book-guide-plan-sentinel" />
    </div>
  );
}

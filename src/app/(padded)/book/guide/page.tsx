import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { guides } from "@/data/guides";
import { LAYOUT, CTA, CARD, TYPE, SECTION } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { trails } from "@/data/trails";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Book a Guided Hike | Cyprus Winter",
  description:
    "Guided winter hikes in Troodos, Paphos, and Akamas. Local guides for Artemis, Caledonia Falls, Adonis, and more. Small groups, winter expertise. Book ahead and they'll confirm by email.",
  alternates: { canonical: `${SITE_URL}/book/guide` },
};

function getTrailNames(guide: (typeof guides)[0]): string[] {
  return guide.trailIds
    .map((tid) => trails.find((t) => t.id === tid || t.slug === tid))
    .filter((t): t is NonNullable<typeof t> => t != null)
    .map((t) => t.name);
}

export default async function GuidesListPage() {
  const [tNav, tCommon, tBookings, tBookPages] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("bookings"),
    getTranslations("book.pages"),
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
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <div className={SECTION.headingMargin}>
        <h1 className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>{tCommon("breadcrumbs.bookGuide")}</h1>
        <p className="text-olive/70 max-w-2xl">
          {tBookPages("guideList.intro")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => {
          const trailNames = getTrailNames(guide);
          return (
            <div
              key={guide.id}
              className={`${CARD.base} ${CARD.content} ${CARD.hover} rounded-xl overflow-hidden flex flex-col`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean">
                  {tCommon("guidedHike")}
                </span>
                {guide.isVerified && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean">
                    {tCommon("verifiedPartner")}
                  </span>
                )}
              </div>
              <h2 className={`${TYPE.cardTitle} mb-1`}>{guide.name}</h2>
              <p className="text-sm text-olive/70 mb-2">{guide.region}</p>
              <p className="text-sm text-olive/80 mb-4 flex-1 line-clamp-3">{guide.description}</p>
              {trailNames.length > 0 && (
                <p className="text-xs text-olive/60 mb-4">
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

      <p className="mt-12 text-center text-olive/70 text-sm">
        <AppLink href="/trails" className={SECTION.aegeanLink}>
          {tBookPages("guideList.footerBrowseTrails")}
        </AppLink>
        {" · "}
        <AppLink href="/bookings" className={SECTION.aegeanLink}>
          {tBookings("title")}
        </AppLink>
      </p>
    </div>
  );
}

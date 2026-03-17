import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { LAYOUT, CTA, EMPTY_STATE_COMPACT, SECTION, TYPE } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchResultCard from "@/components/SearchResultCard";
import { search } from "@/lib/search";
import { getTranslations } from "next-intl/server";

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

export const metadata: Metadata = {
  title: "Search Cyprus Winter | Trails, Wineries, Places",
  description:
    "Search Cyprus winter: trails, wineries, villages, beaches, ancient sites. Find Troodos hikes, Paphos mosaics, Lefkara. Plan or explore when you land. Free search.",
  alternates: { canonical: `${SITE_URL}/search` },
  openGraph: {
    title: "Search Cyprus Winter | Trails, Wineries, Places",
    description: "Search Cyprus winter: trails, wineries, villages, beaches. Find Troodos hikes, Paphos mosaics, Lefkara.",
    url: `${SITE_URL}/search`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Cyprus winter — find trails and places" }],
  },
};

const BROWSE_LINKS: { href: string; labelKey: string }[] = [
  { href: "/trails", labelKey: "trails" },
  { href: "/discover", labelKey: "discover" },
  { href: "/wineries", labelKey: "wineries" },
  { href: "/events", labelKey: "events" },
  { href: "/villages", labelKey: "villages" },
  { href: "/beaches", labelKey: "beaches" },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const tNav = await getTranslations("nav");
  const tSearch = await getTranslations("search");
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const showBrowse = q.length < 2;
  const results = q.length >= 2 ? search(q, 12) : [];
  const hasNoResults = q.length >= 2 && results.length === 0;
  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className="flex flex-col gap-1 mb-8" aria-label="Page navigation">
        <BackLink href="/" label={tNav("home")} />
        <Breadcrumbs
          items={[{ label: tNav("home"), href: "/" }, { label: tNav("search"), href: "/search", isCurrent: true }]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>
      <h1 className={`${TYPE.sectionTitle} mb-2`}>
        {tSearch("title")}
      </h1>
      <p className="text-olive/80 text-sm mb-8">
        {tSearch("intro")}
      </p>
      <SearchBar placeholder={tSearch("placeholder")} autoFocus initialQuery={q} syncUrl className="max-w-xl" />
      {results.length > 0 && (
        <div className={`mt-8 ${SECTION.headingGap}`}>
          <h2 className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>{tSearch("resultsFor", { query: q })}</h2>
          <ul className="grid gap-4 sm:grid-cols-2" role="list">
            {results.map((r) => (
              <li key={`${r.kind}-${r.item.id}`}>
                <SearchResultCard result={r} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasNoResults && (
        <div className={`mt-6 ${EMPTY_STATE_COMPACT}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60 mb-2">
            {tSearch("noResults", { query: q })}
          </p>
          <p className="text-sm text-olive/80 mb-3">{tSearch("noResultsHint")}</p>
          <div className="flex flex-wrap gap-2">
            <AppLink href="/discover" className={`${CTA.chipTertiary} rounded-xl`}>
              {tSearch("browseDiscover")}
            </AppLink>
            <AppLink href="/trails" className={`${CTA.chipTertiary} rounded-xl`}>
              {tSearch("viewTrails")}
            </AppLink>
            <AppLink href="/plan" className={`${CTA.chipTertiary} rounded-xl`}>
              {tSearch("planTrip")}
            </AppLink>
          </div>
        </div>
      )}
      {showBrowse && (
        <div className={SECTION.footerBlock}>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60 mb-3">{tSearch("browseByCategory")}</p>
          <div className="flex flex-wrap gap-2">
            {BROWSE_LINKS.map((link) => (
              <AppLink
                key={link.href}
                href={link.href}
                className={`${CTA.chipTertiary} rounded-xl`}
              >
                {tSearch(`category.${link.labelKey}`)}
              </AppLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

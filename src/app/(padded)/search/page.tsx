import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { LAYOUT, CTA, EMPTY_STATE_COMPACT, SECTION, TYPE } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchResultCard from "@/components/SearchResultCard";
import { search } from "@/lib/search";

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

const BROWSE_LINKS = [
  { href: "/trails", label: "Trails" },
  { href: "/discover", label: "Discover" },
  { href: "/wineries", label: "Wineries" },
  { href: "/events", label: "Events" },
  { href: "/villages", label: "Villages" },
  { href: "/beaches", label: "Beaches" },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const showBrowse = q.length < 2;
  const results = q.length >= 2 ? search(q, 12) : [];
  const hasNoResults = q.length >= 2 && results.length === 0;
  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className="flex flex-col gap-1 mb-8" aria-label="Page navigation">
        <BackLink href="/" label="Home" />
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Search", href: "/search", isCurrent: true }]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>
      <h1 className={`${TYPE.sectionTitle} mb-2`}>
        Find a place or trail
      </h1>
      <p className="text-olive/80 text-sm mb-8">
        Places that feel real. Villages, wineries, beaches, trails, events.
      </p>
      <SearchBar placeholder="e.g. Omodos, Artemis, carnival" autoFocus initialQuery={q} syncUrl className="max-w-xl" />
      {results.length > 0 && (
        <div className={`mt-8 ${SECTION.headingGap}`}>
          <h2 className={`${TYPE.sectionTitle} mb-4`}>Results for &ldquo;{q}&rdquo;</h2>
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
            No matches for &ldquo;{q}&rdquo;. Try Troodos, Nissi, Omodos, or browse Discover.
          </p>
          <p className="text-sm text-olive/80 mb-3">Or tap Ask AI to find something.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/discover" className={`${CTA.chipTertiary} rounded-xl`}>
              Browse places
            </Link>
            <Link href="/trails" className={`${CTA.chipTertiary} rounded-xl`}>
              View all trails
            </Link>
            <Link href="/plan" className={`${CTA.chipTertiary} rounded-xl`}>
              Plan your trip
            </Link>
          </div>
        </div>
      )}
      {showBrowse && (
        <div className={SECTION.footerBlock}>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60 mb-3">Or browse by category</p>
          <div className="flex flex-wrap gap-2">
            {BROWSE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${CTA.chipTertiary} rounded-xl`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

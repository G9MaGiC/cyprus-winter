import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { LAYOUT, CTA, EMPTY_STATE_COMPACT } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";
import BackLink from "@/components/BackLink";
import { search } from "@/lib/search";

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = {
  title: "Search Cyprus Winter | Trails, Wineries, Places",
  description:
    "Search Cyprus winter: trails, wineries, villages, beaches, ancient sites. Find Troodos hikes, Paphos mosaics, Lefkara. Plan your trip or explore now.",
  alternates: { canonical: `${SITE_URL}/search` },
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
      <div className="mb-8">
        <BackLink href="/" label="Home" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
        Find a place or trail
      </h1>
      <p className="text-olive/70 text-sm mb-8">
        Villages, wineries, beaches, trails, events.
      </p>
      <SearchBar placeholder="e.g. Omodos, Artemis, carnival" autoFocus initialQuery={q} className="max-w-xl" />
      {hasNoResults && (
        <div className={`mt-6 ${EMPTY_STATE_COMPACT}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60 mb-3">No matches—try browsing</p>
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
        <div className="mt-10 pt-8 border-t border-sand-200/80">
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

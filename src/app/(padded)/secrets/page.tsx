import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { secretsPageMeta } from "@/lib/locale-page-meta";
import { secretGems } from "@/data/secret-gems";
import { getRelatedPlaces } from "@/lib/related-places";
import { LAYOUT, CARD, EMPTY_STATE, CTA, SECTION } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

export const metadata: Metadata = applyLocaleToMetadata(
  secretsPageMeta,
  "/secrets",
  routing.defaultLocale
);

const typeLabels: Record<string, string> = {
  viewpoint: "Viewpoint",
  kafenion: "Kafenion",
  timing: "Timing",
  pairing: "Pairing",
  spot: "Spot",
};

export default function SecretsPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel="Home"
        title="Cyprus Winter Local Secrets"
        description="Insider tips from people who live here. Kafenions, viewpoints, timings, pairings. Each links to a trail or place."
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Local Secrets", href: "/secrets", isCurrent: true }]}
      >
        <Link href="/plan" className={`mt-4 px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}>
          Plan your trip
        </Link>
      </PageHeader>

      <h2 className="sr-only">Insider tips by region and type</h2>
      {secretGems.length === 0 ? (
        <div className={`mt-10 ${EMPTY_STATE}`} role="status" aria-live="polite">
          <p className="text-olive/80 mb-4">No secrets added yet.</p>
          <Link href="/discover" className={CTA.secondaryCompact}>
            Discover places
          </Link>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {secretGems.map((g) => {
          const place = g.placeId ? getRelatedPlaces([g.placeId])[0] : null;
          return (
            <article
              key={g.id}
              className={`${CARD.content} rounded-xl ${CARD.base} border-l-4 border-l-golden/50 ${CARD.hover}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-terracotta/80">
                  {g.region}
                </span>
                <span className="text-xs text-olive/60">{typeLabels[g.type] ?? g.type}</span>
              </div>
              {place && (
                <Link
                  href={place.href}
                  className={`${SECTION.aegeanLink} gap-1.5 text-xs mb-2`}
                >
                  <span>{place.type === "trail" ? "Trail" : "Place"}:</span>
                  <span>{place.name}</span>
                  <span aria-hidden>→</span>
                </Link>
              )}
              <h3 className={`font-display text-lg font-semibold text-charcoal ${SECTION.titleGap}`}>
                {g.title}
              </h3>
              <p className="text-olive/80 text-sm leading-relaxed mb-4">{g.body}</p>
              {g.href && (
                <Link
                  href={g.href}
                  className={`inline-flex items-center text-sm font-medium text-terracotta hover:text-terracotta/80 ${CARD.link}`}
                >
                  Go there →
                </Link>
              )}
            </article>
          );
        })}
      </div>
      )}
      <div className={`${SECTION.footerBlock} relative`}>
        <span id="secrets-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        <p className="text-center text-olive/70 text-sm max-w-md mx-auto">
        Pair with trails and villages.{" "}
        <Link href="/plan" className={SECTION.aegeanLink}>
          Plan your day
        </Link>
      </p>
      </div>
      <StickyPlanBarBlock sentinelId="secrets-plan-sentinel" />
    </div>
  );
}

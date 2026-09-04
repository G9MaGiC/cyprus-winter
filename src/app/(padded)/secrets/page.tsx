import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { secretGems } from "@/data/secret-gems";
import { localizeSecretGems } from "@/lib/secret-gem-content";
import { getRelatedPlaces } from "@/lib/related-places";
import { HOME, LAYOUT, CARD, EMPTY_STATE, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import HubRegionFilter, { type HubFilterGroup } from "@/components/HubRegionFilter";
import HubFooter from "@/components/HubFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getLocale, getTranslations } from "next-intl/server";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "secrets.page" });
  const title = t("meta.title");
  const description = t("meta.description");
  const alternates = buildStrategyAAlternates("/secrets");
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description: t("meta.ogDescription"),
      url: alternates.canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("meta.ogAlt") }],
    },
  };
}

export default async function SecretsPage() {
  const [tNav, tSecrets, tDiscover] = await Promise.all([
    getTranslations("nav"),
    getTranslations("secrets.page"),
    getTranslations("discover"),
  ]);
  const gems = await localizeSecretGems(secretGems);
  const typeLabels: Record<string, string> = {
    viewpoint: tSecrets("types.viewpoint"),
    kafenion: tSecrets("types.kafenion"),
    timing: tSecrets("types.timing"),
    pairing: tSecrets("types.pairing"),
    spot: tSecrets("types.spot"),
  };
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel={tNav("home")}
        title={tSecrets("header.title")}
        description={tSecrets("header.description")}
        breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("secrets"), href: "/secrets", isCurrent: true }]}
      >
        <AppLink href="/plan" className={`mt-4 px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}>
          {tSecrets("header.planCta")}
        </AppLink>
      </PageHeader>

      <h2 className="sr-only">{tSecrets("sr.tipsIndex")}</h2>
      {secretGems.length === 0 ? (
        <div className={`mt-10 ${EMPTY_STATE}`} role="status" aria-live="polite">
          <p className="text-muted-ink mb-4">{tSecrets("empty.body")}</p>
          <AppLink href="/discover" className={CTA.secondaryCompact}>
            {tSecrets("empty.ctaDiscover")}
          </AppLink>
        </div>
      ) : (
      <>
      {/* Region facets over the ~34k-px flat scroll (AUD-68). */}
      <div className="mt-10">
      {(() => {
        const counts = new Map<string, number>();
        for (const g of secretGems) counts.set(g.region, (counts.get(g.region) ?? 0) + 1);
        const groups: HubFilterGroup[] = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count }));
        return <HubRegionFilter containerId="secrets-grid" groups={groups} total={secretGems.length} />;
      })()}
      </div>
      <div id="secrets-grid" className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
        {gems.map((g) => {
          const place = g.placeId ? getRelatedPlaces([g.placeId])[0] : null;
          return (
            <article
              key={g.id}
              data-hub-group={g.region}
              className={`${CARD.content} rounded-xl ${CARD.base} border-s-4 border-s-golden/50 ${CARD.hover}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                  {g.region}
                </span>
                <span className="text-xs text-muted-ink">{typeLabels[g.type] ?? g.type}</span>
              </div>
              {place && (
                <AppLink
                  href={place.href}
                  className={`${SECTION.aegeanLink} gap-1.5 text-xs mb-2`}
                >
                  <span>
                    {place.type === "trail"
                      ? tSecrets("card.placePrefixTrail")
                      : tSecrets("card.placePrefixPlace")}
                    :
                  </span>
                  <span>{place.name}</span>
                  <span aria-hidden>→</span>
                </AppLink>
              )}
              <h3 className={`${TYPE.cardTitle} text-charcoal ${SECTION.titleGap}`}>
                {g.title}
              </h3>
              <p className="text-muted-ink text-sm leading-relaxed mb-4">{g.body}</p>
              {g.href && (
                <AppLink
                  href={g.href}
                  className={`inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:text-terracotta-muted ${CARD.link}`}
                >
                  {tSecrets("card.goThere")}
                </AppLink>
              )}
            </article>
          );
        })}
      </div>
      </>
      )}
      <span id="secrets-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <HubFooter
        body={tSecrets("footer.hubBody")}
        ariaLabel={tSecrets("aria.actions")}
        askAiLabel={tDiscover("footer.askAi")}
        askAiAriaLabel={tDiscover("aria.askAi")}
      />
      <StickyPlanBarBlock sentinelId="secrets-plan-sentinel" />
    </div>
  );
}

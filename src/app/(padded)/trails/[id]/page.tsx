import type { Metadata } from "next";
import DetailHero from "@/components/DetailHero";
import { getPlaceById } from "@/data";
import { trailConditions, TRAIL_CONDITIONS_AS_OF } from "@/data/trails";
import DetailActionFooter from "@/components/DetailActionFooter";
import { HOME, LAYOUT, CTA, SECTION, TYPE, LAYER } from "@/lib/design-tokens";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site-url";
import { buildStrategyAAlternates, localizedPathname } from "@/lib/seo-locale-urls";
import TrailDetailBackLink from "@/app/(padded)/trails/TrailDetailBackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { StatusBadge, DifficultyBadge } from "@/components/TrailBadges";
import AppLink from "@/components/AppLink";
import { notFound, permanentRedirect } from "next/navigation";
import RelatedPlacesBlock from "@/components/RelatedPlacesBlock";
import TrailMapClient from "@/components/TrailMapClient";
import TrailDetailStickyActions from "@/components/TrailDetailStickyActions";
import { getTrailImage } from "@/lib/cyprus-images";
import { getLatestReportsByTrail } from "@/lib/trail-reports";
import { formatMonthYear, formatReportTimestamp } from "@/lib/format";
import { getSecretsForPlace } from "@/data/secret-gems";
import { localizeSecretGems } from "@/lib/secret-gem-content";
import { matchGuideForTrail } from "@/lib/guide-match";
import TrailBookGuideLink from "@/components/trails/TrailBookGuideLink";
import SectionCard from "@/components/SectionCard";
import TrailWeatherBadge from "@/components/TrailWeatherBadge";
import { getLocalizedName } from "@/lib/localize";
import { localizeTrailContent } from "@/lib/trail-content";
import { getLocale, getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";
import { findTrailByIdOrSlug, isTrailSlugAlias } from "@/lib/trail-resolve";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tTrails = await getTranslations("trails");
  const trail = findTrailByIdOrSlug(id);
  if (!trail) notFound();
  const loc = trail.locationText ?? trail.region;
  const prefix = `${loc}. ${trail.lengthKm} km, ${trail.difficulty}. `;
  const maxDesc = 154 - prefix.length; // leave room for ellipsis
  const desc = trail.description.slice(0, maxDesc).trim() + (trail.description.length > maxDesc ? "…" : "");
  const imageUrl = toAbsoluteUrl(getTrailImage(trail.id));
  const alternates = buildStrategyAAlternates(`/trails/${trail.id}`);
  const imageAlt = tTrails("card.imageAlt", {
    name: trail.name,
    region: trail.region,
    length: trail.lengthKm,
    difficulty: trail.difficulty,
  });
  return {
    title: `${trail.name} | Cyprus Winter Trails`,
    description: prefix + desc,
    alternates,
    openGraph: {
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
  };
}

export default async function TrailPage({
  params,
}: {
  params: Promise<{ id: string; locale?: string }>;
}) {
  const { id, locale = "en" } = await params;
  const trail = findTrailByIdOrSlug(id);
  if (!trail) notFound();
  if (isTrailSlugAlias(id, trail)) {
    const activeLocale = await getLocale();
    permanentRedirect(localizedPathname(`/trails/${trail.id}`, activeLocale));
  }

  const [tNav, tTrailsDetail, tCommon, tTrails, tDiscoverDetail] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "trails.detail" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "trails" }),
    getTranslations({ locale, namespace: "discover.detail" }),
  ]);
  const conditions = trailConditions[trail.id];
  const reports = await getLatestReportsByTrail(trail.id, 3);
  const latestReport = reports[0];
  const guideMatch = matchGuideForTrail(trail.id, locale);
  // AUD-10 slice 13: decision-surface copy overlaid per locale; schema and
  // metadata keep reading the EN base `trail` record.
  const localizedTrail = await localizeTrailContent(trail, locale);
  const trailSecrets = await localizeSecretGems(getSecretsForPlace(trail.id), locale);

  const canonicalUrl = `${SITE_URL}/trails/${trail.id}`;
  const trailImageUrl = toAbsoluteUrl(getTrailImage(trail.id));

  const trailSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": canonicalUrl,
    name: trail.name,
    description: trail.description.slice(0, 160),
    image: trailImageUrl,
    url: canonicalUrl,
    address: { "@type": "PostalAddress", addressLocality: trail.region, addressCountry: "CY" },
    additionalProperty: [
      { "@type": "PropertyValue", name: "distance", value: `${trail.lengthKm} km` },
      { "@type": "PropertyValue", name: "difficulty", value: trail.difficulty },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: SITE_URL },
      { "@type": "ListItem", position: 2, name: tNav("trails"), item: `${SITE_URL}/trails` },
      { "@type": "ListItem", position: 3, name: getLocalizedName(trail, locale), item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-sand">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(trailSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(breadcrumbSchema) }} />
      <div className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail} ${LAYOUT.detailMobileStickyClearance}`}>
        <nav
          className={`sticky ${LAYOUT.stickyTop} ${LAYER.stickyContent} flex flex-col gap-1 ${LAYOUT.stickyBarX} pt-2 pb-2 bg-sand/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sand/90 md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 mb-2`}
          aria-label={tCommon("aria.pageNavigation")}
        >
          <TrailDetailBackLink />
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: tNav("trails"), href: "/trails" },
              { label: getLocalizedName(trail, locale), href: canonicalUrl, isCurrent: true },
            ]}
            className="py-1 px-0 text-xs text-muted-ink"
          />
        </nav>

        <article>
          <DetailHero
            image={getTrailImage(trail.id)}
            imageAlt={`${trail.name}, ${trail.region} — ${trail.lengthKm} km ${trail.difficulty} trail in Cyprus winter`}
            badge={
              <div className="flex flex-wrap items-center gap-2">
                {(latestReport || conditions) && (
                  <StatusBadge status={(latestReport?.status ?? conditions?.status) ?? "open"} />
                )}
                <DifficultyBadge difficulty={trail.difficulty} />
                {trail.routeType && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/25 backdrop-blur-md">
                    {tTrails(
                      `routeTypes.${trail.routeType === "loop" ? "loop" : trail.routeType === "out-and-back" ? "outAndBack" : "pointToPoint"}`
                    )}
                  </span>
                )}
              </div>
            }
            title={getLocalizedName(trail, locale)}
            subtitle={trail.locationText ?? trail.region}
            rounded
          >
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/85">
              <span>{trail.lengthKm} km</span>
              <span>
                {tTrailsDetail("hero.elevationGain", { meters: trail.elevationGainM })}
              </span>
              <span>
                ~{Math.floor(trail.durationMin / 60)}h{trail.durationMin % 60 ? ` ${trail.durationMin % 60}m` : ""}
              </span>
              {trail.elevationMaxM != null && (
                <span>
                  {tTrailsDetail("hero.elevationMax", { meters: trail.elevationMaxM })}
                </span>
              )}
            </div>
            {trail.trailhead && (
              <p className="text-sm text-white/80 mt-2 break-words">
                {tTrailsDetail("hero.trailheadLabel", { name: trail.trailhead })}
                {trail.trailheadCoords && (
                  <>
                    {" · "}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${trail.trailheadCoords.lat},${trail.trailheadCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-white transition-colors"
                    >
                      {tTrailsDetail("hero.navigateToTrailhead")}
                    </a>
                  </>
                )}
              </p>
            )}
          </DetailHero>

          <nav
            className="flex flex-wrap gap-x-4 gap-y-1 py-3 text-sm border-b border-sand-200/70 -mx-1 px-1 overflow-x-auto scroll-smooth scroll-touch [-webkit-overflow-scrolling:touch] overscroll-x-contain"
            aria-label={tTrailsDetail("aria.jumpToSection")}
          >
            <a href="#trail-description" className={`${SECTION.aegeanLink} shrink-0 snap-start`}>
              {tTrailsDetail("nav.overview")}
            </a>
            <a href="#trail-conditions" className={`${SECTION.aegeanLink} shrink-0 snap-start`}>
              {tTrailsDetail("nav.conditions")}
            </a>
            {(trail.trailheadCoords || trail.waypoints?.some((w) => w.lat != null && w.lng != null)) && (
              <a href="#trail-map" className={`${SECTION.aegeanLink} shrink-0 snap-start`}>
                {tTrailsDetail("nav.map")}
              </a>
            )}
            {trail.waypoints && trail.waypoints.length > 0 && (
              <a href="#trail-waypoints" className={`${SECTION.aegeanLink} shrink-0 snap-start`}>
                {tTrailsDetail("nav.waypoints")}
              </a>
            )}
            {trail.combineWith && trail.combineWith.length > 0 && (
              <a href="#trail-pair-with" className={`${SECTION.aegeanLink} shrink-0 snap-start`}>
                {tTrailsDetail("nav.pairWith")}
              </a>
            )}
          </nav>

          <div className={SECTION.blockGap}>
            {/* Top sights */}
            {trail.topSights && trail.topSights.length > 0 && (
              <SectionCard title={tTrailsDetail("topSightsTitle")} borderAccent="sage">
                <ul className="flex flex-wrap gap-2">
                  {trail.topSights.map((s) => (
                    <li
                      key={s}
                      className="px-2.5 py-1 rounded-md text-sm font-medium bg-sage/15 text-olive break-words"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Description */}
            <section id="trail-description">
              <p className="prose-intro text-olive/90 text-lg leading-relaxed break-words">{trail.description}</p>
            </section>

            {/* Conditions / Report — key info above the fold */}
            {(latestReport || conditions) && (
              <SectionCard
                id="trail-conditions"
                title={
                  latestReport
                    ? tTrailsDetail("conditions.latestFromHikers")
                    : tTrailsDetail("conditions.currentConditions")
                }
                subtitle={
                  latestReport
                    ? tTrailsDetail("conditions.communityReport")
                    : tTrailsDetail("conditions.editorialConditions")
                }
                borderAccent="aegean"
              >
                {latestReport ? (
                  <>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-ink">
                      {latestReport.temperatureC != null && (
                        <span>
                          {tTrailsDetail("conditions.temperatureAtTrailhead", {
                            temperature: latestReport.temperatureC,
                          })}
                        </span>
                      )}
                      {latestReport.windKmh != null && (
                        <span>
                          {tTrailsDetail("conditions.windAtTrailhead", {
                            wind: latestReport.windKmh,
                          })}
                        </span>
                      )}
                      <span className="capitalize">
                        {tTrailsDetail("conditions.surfaceLabel", {
                          surface: latestReport.surface,
                        })}
                      </span>
                      <span className="text-muted-ink">{formatReportTimestamp(latestReport.reportedAt, locale)}</span>
                    </div>
                    {latestReport.note && (
                      <p className="mt-3 text-sm text-olive/90 italic break-words">
                        {latestReport.note}
                      </p>
                    )}
                    {reports.length > 1 && (
                      <p className="mt-2 text-xs text-muted-ink">
                        {tTrailsDetail("conditions.recentReportsCount", { count: reports.length })}
                      </p>
                    )}
                  </>
                ) : conditions ? (
                  <>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-ink">
                      {conditions.temperatureC != null && (
                        <span>
                          {tTrailsDetail("conditions.temperatureAtTrailhead", {
                            temperature: conditions.temperatureC,
                          })}
                        </span>
                      )}
                      {conditions.windKmh != null && (
                        <span>
                          {tTrailsDetail("conditions.windAtTrailhead", {
                            wind: conditions.windKmh,
                          })}
                        </span>
                      )}
                      <span className="capitalize">
                        {tTrailsDetail("conditions.surfaceLabel", {
                          surface: conditions.surface,
                        })}
                      </span>
                      {!conditions.lastReportedAt && (
                        <span className="text-muted-ink">
                          {tTrails("conditionsEditorial")} ·{" "}
                          {tTrails("asOf", { date: formatMonthYear(TRAIL_CONDITIONS_AS_OF, locale) })}
                        </span>
                      )}
                    </div>
                    {conditions.tip && (
                      <p className="mt-3 text-sm text-olive/90 italic break-words">{conditions.tip}</p>
                    )}
                  </>
                ) : null}
                <div className="flex flex-wrap gap-3 mt-4">
                  <AppLink href={`/trails/${trail.id}/report`} className={`gap-2 ${CTA.secondaryCompact}`}>
                    {tTrailsDetail("conditions.shareWhatYouSaw")}
                  </AppLink>
                  {(() => {
                    const status = (latestReport?.status ?? conditions?.status) ?? "open";
                    const isUrgent = status === "caution" || status === "closed";
                    const linkClass = isUrgent
                      ? `gap-2 ${CTA.primaryCompact}`
                      : `inline-flex items-center min-h-[44px] gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 border-aegean/60 text-aegean hover:bg-aegean/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background`;
                    return (
                      <TrailBookGuideLink
                        verifiedGuideId={guideMatch.verifiedGuide?.id}
                        trailId={trail.id}
                        directoryHref={guideMatch.directoryHref}
                        className={linkClass}
                      />
                    );
                  })()}
                </div>
              </SectionCard>
            )}

            {!latestReport && !conditions && (
              <SectionCard
                id="trail-conditions"
                title={tTrailsDetail("conditions.titleNoData")}
                borderAccent="aegean"
              >
                <p className="text-sm text-muted-ink mb-4">
                  {tTrailsDetail("conditions.noRecentBody")}
                </p>
                <AppLink href={`/trails/${trail.id}/report`} className={`gap-2 ${CTA.primaryCompact}`}>
                  {tTrailsDetail("conditions.beFirst")}
                </AppLink>
              </SectionCard>
            )}

            {trail.trailheadCoords && (
              <div className="flex items-center gap-2">
                <TrailWeatherBadge
                  lat={trail.trailheadCoords.lat}
                  lng={trail.trailheadCoords.lng}
                  temperatureLabel={tTrailsDetail("liveWeather.temperature")}
                  rainLabel={tTrailsDetail("liveWeather.rain")}
                  liveLabel={tTrailsDetail("liveWeather.live")}
                />
              </div>
            )}

            {/* Safety & essentials — lighter copy on easy trails */}
            <SectionCard
              title={
                trail.difficulty === "easy"
                  ? tTrailsDetail("safety.easyTitle")
                  : tTrailsDetail("safety.title")
              }
              borderAccent="terracotta"
            >
              <p className="text-sm text-olive/90 break-words">
                {trail.difficulty === "easy"
                  ? tTrailsDetail("safety.easyBody")
                  : tTrailsDetail("safety.body")}
              </p>
            </SectionCard>

            {/* Winter safety — directly after Safety & essentials */}
            {localizedTrail.winterSafety && (
              <SectionCard title={tTrailsDetail("winterSafetyTitle")} borderAccent="terracotta">
                <p className="text-olive/90 text-sm leading-relaxed break-words">{localizedTrail.winterSafety}</p>
              </SectionCard>
            )}

            {/* Route map */}
            {(trail.trailheadCoords || trail.waypoints?.some((w) => w.lat != null && w.lng != null)) && (
              <SectionCard id="trail-map" title={tTrailsDetail("routeMapTitle")} borderAccent="aegean">
                <TrailMapClient trail={trail} />
              </SectionCard>
            )}

            {/* Winter notes */}
            {localizedTrail.winterNotes && (
              <SectionCard title={tTrailsDetail("winterNotesTitle")} borderAccent="golden">
                <p className="text-olive/90 text-sm leading-relaxed break-words">{localizedTrail.winterNotes}</p>
              </SectionCard>
            )}

            {/* Waypoints */}
            {trail.waypoints && trail.waypoints.length > 0 && (
              <SectionCard id="trail-waypoints" title={tTrailsDetail("keyStopsTitle")} borderAccent="terracotta">
                <ol className="space-y-4">
                  {trail.waypoints.map((w, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-terracotta/20 text-terracotta font-semibold flex items-center justify-center text-sm">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-olive break-words">{w.name}</p>
                        {w.km != null && (
                          <span className="text-xs text-muted-ink">@ {w.km} km</span>
                        )}
                        {w.note && (
                          <p className="text-sm text-muted-ink mt-0.5 break-words">{w.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </SectionCard>
            )}

            {/* Local secret */}
            {localizedTrail.localSecret && (
              <SectionCard title={tTrailsDetail("localSecretTitle")} borderAccent="golden">
                <p className="text-olive/90 text-sm italic border-s-2 border-terracotta/30 ps-4 break-words">
                  {localizedTrail.localSecret}
                </p>
              </SectionCard>
            )}

            {/* Highlights + Best season + What to bring — sage for trail/nature */}
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
              <SectionCard title={tTrailsDetail("highlightsTitle")} borderAccent="sage">
                <ul className="flex flex-wrap gap-2">
                  {trail.highlights.map((h) => (
                    <li
                      key={h}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-sage/15 text-olive break-words"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <SectionCard title={tTrailsDetail("bestSeasonTitle")} borderAccent="sage">
                <p className="text-muted-ink capitalize text-sm break-words">{trail.bestSeason.join(", ")}</p>
              </SectionCard>
              {trail.bring && trail.bring.length > 0 && (
                <SectionCard title={tTrailsDetail("whatToBringTitle")} borderAccent="sage">
                  <ul className="flex flex-wrap gap-2">
                    {trail.bring.map((item) => (
                      <li
                        key={item}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-sand-200/70 text-olive/90 break-words"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}
            </div>

            {/* Local secrets for this trail */}
            {trailSecrets.length > 0 && (
              <SectionCard title={tTrailsDetail("localSecrets.title")} borderAccent="golden">
                <p className="text-sm text-muted-ink mb-4">
                  {tTrailsDetail("localSecrets.intro")}
                </p>
                <div className="space-y-4">
                  {trailSecrets.map((s) => (
                    <div key={s.id} className="p-4 rounded-xl bg-white/80 border border-sand-200/80">
                      <h3 className={`${TYPE.cardTitle} ${SECTION.titleGap}`}>{s.title}</h3>
                      <p className="text-sm text-muted-ink leading-relaxed break-words">{s.body}</p>
                    </div>
                  ))}
                </div>
                <AppLink
                  href="/secrets"
                  className="mt-4 inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:text-terracotta-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                >
                  {tTrailsDetail("localSecrets.seeAll")}
                </AppLink>
              </SectionCard>
            )}

            {/* Related places */}
            {trail.combineWith && trail.combineWith.length > 0 && (
              <div id="trail-pair-with">
              <RelatedPlacesBlock
                ids={trail.combineWith}
                title={tTrailsDetail("relatedPlaces.title")}
                description={tTrailsDetail("relatedPlaces.description")}
                showAddToItinerary
                addToPlanLabel={tCommon("addToPlan")}
                addToPlanAria={(name) => tDiscoverDetail("combineWith.addToPlanAria", { name })}
              />
              </div>
            )}

            <p className="text-xs text-muted-ink italic break-words pt-8">
              {tCommon("trailsFooterDisclaimer")}
            </p>
            <DetailActionFooter
              placeId={trail.id}
              placeType="trail"
              place={getPlaceById(trail.id)}
              body={tTrailsDetail("footer.addToPlanBody")}
              ariaLabel={tTrailsDetail("aria.trailActions")}
              sentinelId="trail-add-to-plan-sentinel"
            >
              <AppLink href="/trails" className={CTA.secondaryCompact}>
                {tTrailsDetail("footer.viewAllTrails")}
              </AppLink>
            </DetailActionFooter>
          </div>
        </article>
      </div>
      <TrailDetailStickyActions trailId={trail.id} sentinelId="trail-add-to-plan-sentinel" />
    </div>
  );
}

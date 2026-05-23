import type { Metadata } from "next";
import DetailHero from "@/components/DetailHero";
import { getPlaceById } from "@/data";
import { trails, trailConditions } from "@/data/trails";
import DetailActionFooter from "@/components/DetailActionFooter";
import { LAYOUT, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import TrailDetailBackLink from "@/app/(padded)/trails/TrailDetailBackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { StatusBadge, DifficultyBadge } from "@/components/TrailBadges";
import AppLink from "@/components/AppLink";
import { notFound } from "next/navigation";
import RelatedPlacesBlock from "@/components/RelatedPlacesBlock";
import TrailMapClient from "@/components/TrailMapClient";
import TrailDetailStickyActions from "@/components/TrailDetailStickyActions";
import { getTrailImage } from "@/lib/cyprus-images";
import { getLatestReportsByTrail } from "@/lib/trail-reports";
import { formatReportedAgo } from "@/lib/format";
import { getSecretsForPlace } from "@/data/secret-gems";
import { guides } from "@/data/guides";
import SectionCard from "@/components/SectionCard";
import { getLocalizedName } from "@/lib/localize";
import { getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const trail = trails.find((t) => t.id === id || t.slug === id);
  if (!trail) return { title: "Not found" };
  const loc = trail.locationText ?? trail.region;
  const prefix = `${loc}. ${trail.lengthKm} km, ${trail.difficulty}. `;
  const maxDesc = 154 - prefix.length; // leave room for ellipsis
  const desc = trail.description.slice(0, maxDesc).trim() + (trail.description.length > maxDesc ? "…" : "");
  const imageUrl = toAbsoluteUrl(getTrailImage(trail.id));
  const alternates = buildStrategyAAlternates(`/trails/${id}`);
  return {
    title: `${trail.name} | Cyprus Winter Trails`,
    description: prefix + desc,
    alternates,
    openGraph: {
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${trail.name}, ${trail.region} — ${trail.lengthKm} km trail in Cyprus winter` }],
    },
  };
}

export default async function TrailPage({
  params,
}: {
  params: Promise<{ id: string; locale?: string }>;
}) {
  const { id, locale = "en" } = await params;
  const [tNav, tTrailsDetail, tCommon, tTrails] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "trails.detail" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "trails" }),
  ]);
  const trail = trails.find((t) => t.id === id || t.slug === id);
  if (!trail) notFound();

  const conditions = trailConditions[trail.id];
  const reports = await getLatestReportsByTrail(trail.id, 3);
  const latestReport = reports[0];

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
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Trails", item: `${SITE_URL}/trails` },
      { "@type": "ListItem", position: 3, name: getLocalizedName(trail, locale), item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-sand pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(trailSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(breadcrumbSchema) }} />
      <div className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail}`}>
        <nav
          className={`sticky ${LAYOUT.stickyTop} z-10 flex flex-col gap-1 ${LAYOUT.stickyBarX} pt-2 pb-2 bg-sand/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sand/90 md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 mb-2`}
          aria-label={tCommon("aria.pageNavigation")}
        >
          <TrailDetailBackLink />
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: tNav("trails"), href: "/trails" },
              { label: getLocalizedName(trail, locale), href: canonicalUrl, isCurrent: true },
            ]}
            className="py-1 px-0 text-xs text-olive/60"
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
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/25 backdrop-blur-md capitalize">
                    {trail.routeType.replace("-", " ")}
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
                borderAccent="aegean"
              >
                {latestReport ? (
                  <>
                    <div className="flex flex-wrap gap-4 text-sm text-olive/80">
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
                      <span className="text-olive/60">{formatReportedAgo(latestReport.reportedAt, locale)}</span>
                    </div>
                    {latestReport.note && (
                      <p className="mt-3 text-sm text-olive/90 italic break-words">
                        {latestReport.note}
                      </p>
                    )}
                    {reports.length > 1 && (
                      <p className="mt-2 text-xs text-olive/60">
                        {tTrailsDetail("conditions.recentReportsCount", { count: reports.length })}
                      </p>
                    )}
                  </>
                ) : conditions ? (
                  <>
                    <div className="flex flex-wrap gap-4 text-sm text-olive/80">
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
                        <span className="text-olive/60">{tTrails("conditionsEditorial")}</span>
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
                    if (status === "caution" || status === "closed") {
                      const guideForTrail = guides.find(
                        (g) => g.isVerified && g.trailIds.includes(trail.id)
                      );
                      const linkClass =
                        "inline-flex items-center min-h-[44px] gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 border-aegean/60 text-aegean hover:bg-aegean/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
                      if (guideForTrail) {
                        return (
                          <AppLink
                            href={`/book/guide/${guideForTrail.id}?trail=${trail.id}`}
                            className={linkClass}
                          >
                            Book a guide
                          </AppLink>
                        );
                      }
                      return (
                        <a
                          href="https://www.cyprusactivetours.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                        >
                          Book a guide
                        </a>
                      );
                    }
                    return null;
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
                <p className="text-sm text-olive/70 mb-4">
                  {tTrailsDetail("conditions.noRecentBody")}
                </p>
                <AppLink href={`/trails/${trail.id}/report`} className={`gap-2 ${CTA.primaryCompact}`}>
                  {tTrailsDetail("conditions.beFirst")}
                </AppLink>
              </SectionCard>
            )}

            {/* Safety & essentials — early placement for discoverability */}
            <SectionCard title={tTrailsDetail("safety.title")} borderAccent="terracotta">
              <p className="text-sm text-olive/90 break-words">
                {tTrailsDetail("safety.body")}
              </p>
            </SectionCard>

            {/* Winter safety — directly after Safety & essentials */}
            {trail.winterSafety && (
              <SectionCard title={tTrailsDetail("winterSafetyTitle")} borderAccent="terracotta">
                <p className="text-olive/90 text-sm leading-relaxed break-words">{trail.winterSafety}</p>
              </SectionCard>
            )}

            {/* Route map */}
            {(trail.trailheadCoords || trail.waypoints?.some((w) => w.lat != null && w.lng != null)) && (
              <SectionCard id="trail-map" title={tTrailsDetail("routeMapTitle")} borderAccent="aegean">
                <TrailMapClient trail={trail} />
              </SectionCard>
            )}

            {/* Winter notes */}
            {trail.winterNotes && (
              <SectionCard title={tTrailsDetail("winterNotesTitle")} borderAccent="golden">
                <p className="text-olive/90 text-sm leading-relaxed break-words">{trail.winterNotes}</p>
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
                          <span className="text-xs text-olive/60">@ {w.km} km</span>
                        )}
                        {w.note && (
                          <p className="text-sm text-olive/80 mt-0.5 break-words">{w.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </SectionCard>
            )}

            {/* Local secret */}
            {trail.localSecret && (
              <SectionCard title={tTrailsDetail("localSecretTitle")} borderAccent="golden">
                <p className="text-olive/90 text-sm italic border-l-2 border-terracotta/30 pl-4 break-words">
                  {trail.localSecret}
                </p>
              </SectionCard>
            )}

            {/* Highlights + Best season + What to bring — sage for trail/nature */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <p className="text-olive/80 capitalize text-sm break-words">{trail.bestSeason.join(", ")}</p>
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
            {getSecretsForPlace(trail.id).length > 0 && (
              <SectionCard title={tTrailsDetail("localSecrets.title")} borderAccent="golden">
                <p className="text-sm text-olive/70 mb-4">
                  {tTrailsDetail("localSecrets.intro")}
                </p>
                <div className="space-y-4">
                  {getSecretsForPlace(trail.id).map((s) => (
                    <div key={s.id} className="p-4 rounded-xl bg-white/80 border border-sand-200/80">
                      <h3 className={`${TYPE.cardTitle} ${SECTION.titleGap}`}>{s.title}</h3>
                      <p className="text-sm text-olive/80 leading-relaxed break-words">{s.body}</p>
                    </div>
                  ))}
                </div>
                <AppLink
                  href="/secrets"
                  className="mt-4 inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:text-terracotta/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
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
              />
              </div>
            )}

            <p className="text-xs text-olive/60 italic break-words pt-8">
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

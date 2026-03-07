import type { Metadata } from "next";
import DetailHero from "@/components/DetailHero";
import { trails, trailConditions } from "@/data/trails";
import { LAYOUT, CTA } from "@/lib/design-tokens";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site-url";
import BackLink from "@/components/BackLink";
import { StatusBadge, DifficultyBadge } from "@/components/TrailBadges";
import Link from "next/link";
import { notFound } from "next/navigation";
import RelatedPlacesBlock from "@/components/RelatedPlacesBlock";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import TrailMapClient from "@/components/TrailMapClient";
import TrailDetailStickyActions from "@/components/TrailDetailStickyActions";
import { TrackOnClick } from "@/components/TrackOnClick";
import { getTrailImage } from "@/lib/cyprus-images";
import { getLatestReportsByTrail } from "@/lib/trail-reports";
import { formatReportedAgo } from "@/lib/format";
import { getSecretsForPlace } from "@/data/secret-gems";
import { guides } from "@/data/guides";
import SectionCard from "@/components/SectionCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const trail = trails.find((t) => t.id === id || t.slug === id);
  if (!trail) return { title: "Not found" };
  const prefix = `${trail.region}. ${trail.lengthKm}km, ${trail.difficulty}. `;
  const maxDesc = 154 - prefix.length; // leave room for ellipsis
  const desc = trail.description.slice(0, maxDesc).trim() + (trail.description.length > maxDesc ? "…" : "");
  const imageUrl = toAbsoluteUrl(getTrailImage(trail.id));
  return {
    title: `${trail.name} | Cyprus Winter Trails`,
    description: prefix + desc,
    alternates: { canonical: `${SITE_URL}/trails/${id}` },
    openGraph: {
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${trail.name}, ${trail.region}—${trail.lengthKm}km trail in Cyprus winter` }],
    },
  };
}

export default async function TrailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      { "@type": "ListItem", position: 3, name: trail.name, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-sand pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trailSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail}`}>
        <div className={`sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 ${LAYOUT.stickyBarX} -mt-2 pt-2 pb-2 bg-sand/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sand/90 md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0`}>
          <BackLink href="/trails" label="Back to Trails" />
        </div>

        <article>
          <DetailHero
            image={getTrailImage(trail.id)}
            imageAlt={`${trail.name}, ${trail.region}—${trail.lengthKm}km ${trail.difficulty} trail in Cyprus winter`}
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
            title={trail.name}
            titleEl={trail.nameEl}
            subtitle={trail.region}
            rounded
          >
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/85">
              <span>{trail.lengthKm} km</span>
              <span>{trail.elevationGainM}m gain</span>
              <span>~{Math.round(trail.durationMin / 60)}h</span>
              {trail.elevationMaxM != null && (
                <span>Max {trail.elevationMaxM}m</span>
              )}
            </div>
            {trail.trailhead && (
              <p className="text-sm text-white/80 mt-2 break-words">
                Trailhead: {trail.trailhead}
              </p>
            )}
          </DetailHero>

          <div className="space-y-10 sm:space-y-14">
            {/* Description */}
            <section>
              <p className="prose-intro text-olive/90 text-lg leading-relaxed break-words">{trail.description}</p>
            </section>

            {/* Conditions / Report — key info above the fold */}
            {(latestReport || conditions) && (
              <SectionCard title={latestReport ? "Latest from hikers" : "Current conditions"} borderAccent="aegean">
                {latestReport ? (
                  <>
                    <div className="flex flex-wrap gap-4 text-sm text-olive/80">
                      {latestReport.temperatureC != null && (
                        <span>{latestReport.temperatureC}°C at trailhead</span>
                      )}
                      {latestReport.windKmh != null && (
                        <span>{latestReport.windKmh} km/h wind</span>
                      )}
                      <span className="capitalize">Surface: {latestReport.surface}</span>
                      <span className="text-olive/60">{formatReportedAgo(latestReport.reportedAt)}</span>
                    </div>
                    {latestReport.note && (
                      <p className="mt-3 text-sm text-olive/90 italic break-words">
                        {latestReport.note}
                      </p>
                    )}
                    {reports.length > 1 && (
                      <p className="mt-2 text-xs text-olive/60">{reports.length} recent reports</p>
                    )}
                  </>
                ) : conditions ? (
                  <>
                    <div className="flex flex-wrap gap-4 text-sm text-olive/80">
                      {conditions.temperatureC != null && (
                        <span>{conditions.temperatureC}°C at trailhead</span>
                      )}
                      {conditions.windKmh != null && (
                        <span>{conditions.windKmh} km/h wind</span>
                      )}
                      <span className="capitalize">Surface: {conditions.surface}</span>
                    </div>
                    {conditions.tip && (
                      <p className="mt-3 text-sm text-olive/90 italic break-words">{conditions.tip}</p>
                    )}
                  </>
                ) : null}
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link href={`/trails/${trail.id}/report`} className={`gap-2 ${CTA.secondaryCompact}`}>
                    Share what you saw
                  </Link>
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
                          <Link
                            href={`/book/guide/${guideForTrail.id}?trail=${trail.id}`}
                            className={linkClass}
                          >
                            Book a guide
                          </Link>
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
              <SectionCard title="Trail conditions" borderAccent="aegean">
                <p className="text-sm text-olive/70 mb-4">No recent conditions for this trail. Just back? Share what you saw—it takes a minute.</p>
                <Link href={`/trails/${trail.id}/report`} className={`gap-2 ${CTA.primaryCompact}`}>
                  Be the first to report
                </Link>
              </SectionCard>
            )}

            {/* Safety & essentials — early placement for discoverability */}
            <SectionCard title="Safety & essentials" borderAccent="terracotta">
              <p className="text-sm text-olive/90 break-words">
                Emergency <strong>112</strong> · Tourist info <strong>1460</strong> · Ambulance <strong>199</strong>. Layers, water, charged phone. Check conditions before you go.
              </p>
            </SectionCard>

            {/* Winter safety — directly after Safety & essentials */}
            {trail.winterSafety && (
              <SectionCard title="Winter safety" borderAccent="terracotta">
                <p className="text-olive/90 text-sm leading-relaxed break-words">{trail.winterSafety}</p>
              </SectionCard>
            )}

            {/* Route map */}
            {(trail.trailheadCoords || trail.waypoints?.some((w) => w.lat != null && w.lng != null)) && (
              <SectionCard title="Route map" borderAccent="aegean">
                <TrailMapClient trail={trail} />
              </SectionCard>
            )}

            {/* Winter notes */}
            {trail.winterNotes && (
              <SectionCard title="Winter notes" borderAccent="golden">
                <p className="text-olive/90 text-sm leading-relaxed break-words">{trail.winterNotes}</p>
              </SectionCard>
            )}

            {/* Waypoints */}
            {trail.waypoints && trail.waypoints.length > 0 && (
              <SectionCard title="Key stops" borderAccent="terracotta">
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
              <SectionCard title="Local secret" borderAccent="golden">
                <p className="text-olive/90 text-sm italic border-l-2 border-terracotta/30 pl-4 break-words">
                  {trail.localSecret}
                </p>
              </SectionCard>
            )}

            {/* Highlights + Best season + What to bring */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SectionCard title="Highlights" borderAccent="sage">
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
              <SectionCard title="Best season" borderAccent="sage">
                <p className="text-olive/80 capitalize text-sm break-words">{trail.bestSeason.join(", ")}</p>
              </SectionCard>
              {trail.bring && trail.bring.length > 0 && (
                <SectionCard title="What to bring" borderAccent="sage">
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
              <SectionCard title="Local secrets" borderAccent="golden">
                <p className="text-sm text-olive/70 mb-4">
                  Insider tips for this trail. Pairings, timings, what to do after.
                </p>
                <div className="space-y-4">
                  {getSecretsForPlace(trail.id).map((s) => (
                    <div key={s.id} className="p-4 rounded-lg bg-white/80 border border-sand-200/80">
                      <h3 className="font-display font-semibold text-olive mb-1">{s.title}</h3>
                      <p className="text-sm text-olive/80 leading-relaxed break-words">{s.body}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/secrets"
                  className="mt-4 inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:text-terracotta/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                >
                  See all local secrets →
                </Link>
              </SectionCard>
            )}

            {/* Related places */}
            {trail.combineWith && trail.combineWith.length > 0 && (
              <RelatedPlacesBlock
                ids={trail.combineWith}
                description="Hike in the morning, village or winery in the afternoon. Start by 9am."
                showAddToItinerary
              />
            )}

            {/* Footer CTA */}
            <footer className="pt-8 flex flex-col gap-4 relative" aria-label="Trail actions">
              <div id="trail-add-to-plan-sentinel" aria-hidden className="h-px absolute top-0 left-0 right-0 pointer-events-none" />
              <p className="text-olive/70 text-sm break-words">
                Add this trail to your plan and pair with a village or winery in the afternoon.
              </p>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Actions">
                <TrackOnClick event="plan_add" properties={{ placeId: trail.id, placeType: "trail" }}>
                  <AddToItineraryButton placeId={trail.id} />
                </TrackOnClick>
                <Link
                  href="/trails"
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[120px] gap-2 px-5 py-3 rounded-lg border-2 border-aegean/60 text-aegean font-medium hover:bg-aegean/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  View all trails
                </Link>
              </div>
            </footer>
          </div>
        </article>
      </div>
      <TrailDetailStickyActions trailId={trail.id} sentinelId="trail-add-to-plan-sentinel" />
    </div>
  );
}

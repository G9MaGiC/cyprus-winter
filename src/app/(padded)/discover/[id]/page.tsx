import Image from "next/image";
import type { Metadata } from "next";
import { allDiscoverIds, getDiscoverPlaceById, getPlaceById } from "@/data";
import { getAttractionImage } from "@/lib/cyprus-images";
import { type Winery } from "@/data/wineries";
import type { Attraction } from "@/data/attractions";
import type { Restaurant } from "@/data/restaurants";
import { LAYOUT, CARD, CALLOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import DiscoverDetailBackLink from "@/app/(padded)/discover/DiscoverDetailBackLink";
import AppLink from "@/components/AppLink";
import { notFound } from "next/navigation";
import RelatedPlacesBlock from "@/components/RelatedPlacesBlock";
import DetailActionFooter from "@/components/DetailActionFooter";
import StickyAddToPlanBar from "@/components/StickyAddToPlanBar";
import { getSecretsForPlace } from "@/data/secret-gems";
import { getSimilarDiscoverPlaces } from "@/lib/related-places";
import TrackView from "@/components/TrackView";
import TrackEventOnMount from "@/components/TrackEventOnMount";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLocalizedName } from "@/lib/localize";
import { getTranslations } from "next-intl/server";
import { toSafeJsonForScript } from "@/lib/json-script";
import {
  discoverDetailHref,
  discoverListHref,
  getDiscoverTypeLabel,
} from "@/lib/discover-links";
import DetailHeroSection from "./DetailHeroSection";
import DetailPracticalInfo from "./DetailPracticalInfo";
import DetailBookingSection from "./DetailBookingSection";
import DiscoverLocationMap from "@/components/DiscoverLocationMap";
import { isBufferZoneCulturalNote } from "@/lib/discover-place-utils";
import { applyPartnerOpeningHours } from "@/lib/partner-overlay";

function isWinery(a: Attraction | Restaurant): a is Winery {
  return a.type === "winery";
}

function isRestaurant(a: Attraction | Restaurant): a is Restaurant {
  return a.type === "restaurant";
}

export function generateStaticParams() {
  return allDiscoverIds.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale?: string }>;
}): Promise<Metadata> {
  const { id, locale = "en" } = await params;
  const tDetail = await getTranslations({ locale, namespace: "discover.detail" });
  const a = getDiscoverPlaceById(id);
  if (!a) notFound();
  const typeLabel =
    a.type === "winery"
      ? tDetail("metadata.typeWinery")
      : a.type === "restaurant"
        ? tDetail("metadata.typeEat")
        : a.type.charAt(0).toUpperCase() + a.type.slice(1);
  const prefix = `${a.region}. ${typeLabel}. `;
  const maxDesc = 154 - prefix.length;
  const desc = a.description.slice(0, maxDesc).trim();
  const snippet = prefix + desc + (a.description.length > maxDesc ? "…" : "");
  const imageUrl = toAbsoluteUrl(getAttractionImage(a.id, a.type));
  const alternates = buildStrategyAAlternates(`/discover/${id}`);
  const imageAlt = tDetail("imageAlt", { name: a.name, region: a.region, type: typeLabel });
  return {
    title: `${a.name} | Cyprus Winter`,
    description: snippet,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: `${a.name} | Cyprus Winter`,
      description: snippet,
      url: alternates.canonical,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${a.name} | Cyprus Winter`,
      description: snippet,
      images: [imageUrl],
    },
  };
}


export default async function AttractionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locale?: string }>;
  searchParams: Promise<{ from?: string; filter?: string; q?: string }>;
}) {
  const { id, locale = "en" } = await params;
  const { from, filter: filterParam } = await searchParams;
  const preserveFilter = from === "discover" ? filterParam : undefined;
  const discoverBackHref = discoverListHref(preserveFilter);
  const [tNav, tDetail, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "discover.detail" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const found = getDiscoverPlaceById(id);
  if (!found) notFound();
  const a = applyPartnerOpeningHours(found);

  const typeLabel = getDiscoverTypeLabel(a.type, tDetail, tCommon);
  const placeSecrets = getSecretsForPlace(a.id);
  const showInlineLocalSecret = Boolean(a.localSecret) && placeSecrets.length === 0;

  const canonicalUrl = `${SITE_URL}/discover/${id}`;
  const imageUrl = toAbsoluteUrl(getAttractionImage(a.id, a.type));

  const attractionSchema = {
    "@context": "https://schema.org",
    "@type": isRestaurant(a) ? "Restaurant" : "TouristAttraction",
    name: a.name,
    description: a.description.slice(0, 160),
    image: imageUrl,
    url: canonicalUrl,
    address: { "@type": "PostalAddress", addressLocality: a.region, addressCountry: "CY" },
    ...(isRestaurant(a) && a.cuisine && { servesCuisine: a.cuisine }),
  };

  const localBusinessSchema = isWinery(a)
    ? {
        "@context": "https://schema.org",
        "@type": "Winery",
        name: a.name,
        description: a.description.slice(0, 160),
        image: imageUrl,
        url: canonicalUrl,
        address: { "@type": "PostalAddress", addressLocality: a.region, addressCountry: "CY" },
        ...(a.openingHours && { openingHours: a.openingHours }),
        ...(a.contactPhone && { telephone: a.contactPhone }),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
      itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: tNav("discover"),
        item: `${SITE_URL}${discoverBackHref}`,
      },
      { "@type": "ListItem", position: 3, name: getLocalizedName(a, locale), item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-sand">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(attractionSchema) }} />
      {localBusinessSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(localBusinessSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(breadcrumbSchema) }} />
      <div className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail} ${LAYOUT.detailMobileStickyClearance}`}>
        <TrackView
          id={a.id}
          name={a.name}
          type={getPlaceById(a.id)?.type ?? a.type}
          region={a.region}
        />
        <TrackEventOnMount event="decision_rationale_view" properties={{ place_id: a.id, place_type: a.type }} />
        <nav className="flex flex-col gap-1 mb-6" aria-label={tDetail("pageNavAria")}>
          <DiscoverDetailBackLink />
          <Breadcrumbs
            items={[
              { label: tNav("home"), href: "/" },
              { label: tNav("discover"), href: discoverBackHref },
              { label: a.name, href: canonicalUrl, isCurrent: true },
            ]}
            className="py-1 px-0 text-xs text-muted-ink"
          />
        </nav>

        <article aria-label={tDetail("articleAria", { name: a.name, type: typeLabel, region: a.region })}>
          <DetailHeroSection
            a={a}
            locale={locale}
            typeLabel={typeLabel}
            tDetail={tDetail}
          />

          <div className="space-y-10 sm:space-y-14 mt-10 sm:mt-14">

            {/* Highlights + Great for */}
            <section>
              <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                {tDetail("headings.highlights")}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {a.highlights.map((h) => (
                  <li
                    key={h}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/90 border border-sand-200/80 text-olive/90 break-words shadow-sm"
                  >
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <h3 className={`${TYPE.kicker} text-muted-ink mb-1`}>
                  {tDetail("headings.greatFor")}
                </h3>
                <p className="text-muted-ink text-base break-words">{a.bestFor.join(" · ")}</p>
              </div>
              {isRestaurant(a) && (a.cuisine || a.priceRange) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {a.cuisine && (
                    <span className="px-3 py-1 rounded-md text-sm font-medium bg-golden/20 text-charcoal">
                      {a.cuisine}
                    </span>
                  )}
                  {a.priceRange && (
                    <span className="text-muted-ink text-sm">{a.priceRange}</span>
                  )}
                </div>
              )}
            </section>

            {/* Multi-venue: dining and shops */}
            {isRestaurant(a) && ((a.diningVenues && a.diningVenues.length > 0) || (a.shops && a.shops.length > 0)) && (
              <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80 space-y-4`}>
                {a.diningVenues && a.diningVenues.length > 0 && (
                  <div>
                    <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                      {tDetail("headings.dining")}
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                      {a.diningVenues.map((v) => (
                        <li
                          key={v}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/90 border border-sand-200/80 text-olive/90"
                        >
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {a.shops && a.shops.length > 0 && (
                  <div>
                    <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                      {tDetail("headings.shops")}
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                      {a.shops.map((s) => (
                        <li
                          key={s}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/90 border border-sand-200/80 text-muted-ink"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Winery: Tasting info */}
            {isWinery(a) && a.tastingInfo && (
              <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80`}>
                <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                  {tDetail("visitTaste.title")}
                </h2>
                <p className="text-olive/90 text-base leading-relaxed break-words">{a.tastingInfo}</p>
                {a.wineRoute && (
                  <p className="text-muted-ink text-sm mt-2 break-words">
                    {tDetail("wineRoute", { route: a.wineRoute })}
                  </p>
                )}
              </section>
            )}

            <DetailPracticalInfo a={a} tDetail={tDetail} />

            <DetailBookingSection a={a} tDetail={tDetail} />

            {isWinery(a) && a.signatureWines && a.signatureWines.length > 0 && (
              <section>
                <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                  {tDetail("ourWines.title")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {a.signatureWines.map((wine) => (
                    <div
                      key={wine.name}
                      className="rounded-xl bg-white/90 border border-sand-200/80 hover:border-terracotta/20 transition-all duration-200 overflow-hidden group shadow-sm"
                    >
                  <div className="aspect-[3/4] relative bg-sand-100 overflow-hidden">
                    {wine.image ? (
                      <Image
                        src={wine.image}
                        alt={`${wine.name} ${wine.variety ? `— ${wine.variety}` : ""} at ${a.name}, Cyprus winter wine`}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 180px"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs font-medium text-muted-ink"
                        aria-hidden
                      >
                        {wine.name}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className={`${TYPE.cardTitleCompact} break-words`}>{wine.name}</p>
                    {wine.variety && (
                      <p className="text-xs text-muted-ink mt-0.5 break-words">{wine.variety}</p>
                    )}
                    {wine.price && (
                      <p className="text-sm font-semibold text-terracotta mt-1">{wine.price}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
              </section>
            )}

            {(a.winterTip || a.bestTimeToVisit || showInlineLocalSecret) && (
              <section className={`${CARD.base} ${CARD.contentLg} ${CALLOUT.tip} space-y-4`}>
                <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                  {tDetail("localSecretHeading")}
                </h2>
            {a.winterTip && (
              <p className="text-olive/90 text-base leading-relaxed break-words">{a.winterTip}</p>
            )}
            {a.bestTimeToVisit && (
              <p className="text-muted-ink text-base break-words">
                <strong>{tDetail("bestTimeLabel")}</strong> {a.bestTimeToVisit}
              </p>
            )}
            {showInlineLocalSecret && a.localSecret && (
              <p className="text-olive/90 text-base italic border-s-2 border-terracotta/30 ps-4 break-words">
                {a.localSecret}
              </p>
            )}
              </section>
            )}

            {"backstory" in a && a.backstory && (
              <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80`}>
                <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                  {tDetail("backstoryHeading")}
                </h2>
                <p className="text-olive/90 text-base leading-relaxed break-words">{a.backstory}</p>
              </section>
            )}

            {"culturalNote" in a && a.culturalNote && !isBufferZoneCulturalNote(a.culturalNote) && (
              <p className="text-muted-ink text-base italic break-words">
                {a.culturalNote}
              </p>
            )}

            {typeof a.latitude === "number" && typeof a.longitude === "number" && (
              <section>
                <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                  {tDetail("location.title")}
                </h2>
                <DiscoverLocationMap
                  name={a.name}
                  latitude={a.latitude}
                  longitude={a.longitude}
                  iframeTitle={tDetail("map.iframeTitle", { name: a.name })}
                  directionsAria={tDetail("directionsAria")}
                  directionsCta={tDetail("directionsCta")}
                  loadMapLabel={tDetail("map.loadMap")}
                />
              </section>
            )}

            {placeSecrets.length > 0 && (
              <section className={`${CARD.base} ${CARD.contentLg} ${CALLOUT.tip}`}>
                <h2 className={`text-xs font-semibold uppercase tracking-widest text-muted-ink ${SECTION.headingGap}`}>
                  {tDetail("localSecrets.title")}
                </h2>
                <p className="text-sm text-muted-ink mb-4">
                  {tDetail("localSecrets.intro")}
                </p>
                <div className="space-y-4">
                  {placeSecrets.map((s) => (
                    <div key={s.id} className="p-4 rounded-lg bg-white/80 border border-sand-200/80">
                      <h3 className={`${TYPE.cardTitle} ${SECTION.titleGap}`}>{s.title}</h3>
                      <p className="text-sm text-muted-ink leading-relaxed break-words">{s.body}</p>
                    </div>
                  ))}
                </div>
                <AppLink
                  href="/secrets"
                  className="mt-4 inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:text-terracotta-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                >
                  {tDetail("localSecrets.seeAll")}
                </AppLink>
              </section>
            )}

            {a.combineWith && a.combineWith.filter((cid) => getPlaceById(cid)).length > 0 && (
              <RelatedPlacesBlock
                ids={a.combineWith.filter((cid) => getPlaceById(cid))}
                title={tDetail("combineWith.title")}
                description={tDetail("combineWith.description")}
                discoverFilter={preserveFilter}
                showAddToItinerary
                addToPlanLabel={tCommon("addToPlan")}
                addToPlanAria={(name) => tDetail("combineWith.addToPlanAria", { name })}
              />
            )}

            {(() => {
              const similar = getSimilarDiscoverPlaces(a.id, a.type, a.region);
              if (similar.length === 0) return null;
              const similarTypeKey =
                a.type === "winery" ||
                a.type === "restaurant" ||
                a.type === "beach" ||
                a.type === "ancient" ||
                a.type === "village" ||
                a.type === "monastery" ||
                a.type === "activity" ||
                a.type === "nature"
                  ? a.type
                  : "default";
              const typeLabel = tDetail(`similar.typeLabels.${similarTypeKey}`);
              return (
                <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90`}>
                  <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}>
                    {tDetail("similar.title", { type: typeLabel, region: a.region })}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {similar.map((r) => (
                      <li key={r.id}>
                        <AppLink
                          href={
                            r.href.startsWith("/discover/")
                              ? discoverDetailHref(r.id, preserveFilter)
                              : r.href
                          }
                          className="inline-flex items-center min-h-[44px] gap-1.5 px-4 py-2.5 rounded-lg bg-sand-100/80 border border-sand-200/80 text-olive font-medium text-sm hover:text-terracotta-muted hover:border-terracotta/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {r.name} <span aria-hidden>→</span>
                        </AppLink>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })()}

            <DetailActionFooter
              placeId={a.id}
              placeType={a.type}
              place={getPlaceById(a.id)}
              body={tDetail("footer.body")}
              ariaLabel={tDetail("actionsAria")}
            />
          </div>
        </article>
        <StickyAddToPlanBar placeId={a.id} sentinelId="add-to-plan-sentinel" />
      </div>
    </div>
  );
}

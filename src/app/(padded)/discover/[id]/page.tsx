import Image from "next/image";
import DetailHero from "@/components/DetailHero";
import type { Metadata } from "next";
import { allDiscoverIds, getDiscoverPlaceById, getPlaceById } from "@/data";
import { discoverDetailMetadata } from "@/lib/locale-metadata-dynamic";
import { routing } from "@/i18n/routing";
import { getAttractionImage } from "@/lib/cyprus-images";
import { type Winery } from "@/data/wineries";
import type { Attraction } from "@/data/attractions";
import type { Restaurant } from "@/data/restaurants";
import { LAYOUT, CTA, CARD, CALLOUT, SECTION } from "@/lib/design-tokens";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site-url";
import BackLink from "@/components/BackLink";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import RelatedPlacesBlock from "@/components/RelatedPlacesBlock";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import NavigateButton from "@/components/NavigateButton";
import StickyAddToPlanBar from "@/components/StickyAddToPlanBar";
import { TrackOnClick } from "@/components/TrackOnClick";
import { getSecretsForPlace } from "@/data/secret-gems";
import { getSimilarDiscoverPlaces } from "@/lib/related-places";
import TrackView from "@/components/TrackView";
import Breadcrumbs from "@/components/Breadcrumbs";

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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return discoverDetailMetadata(id, routing.defaultLocale);
}


export default async function AttractionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = getDiscoverPlaceById(id);
  if (!a) notFound();

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
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Discover", item: `${SITE_URL}/discover` },
      { "@type": "ListItem", position: 3, name: a.name, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-sand">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(attractionSchema) }} />
      {localBusinessSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail} pb-24 sm:pb-12`}>
        <TrackView id={a.id} name={a.name} type={a.type} region={a.region} />
        <nav className="flex flex-col gap-1 mb-6" aria-label="Page navigation">
          <BackLink href="/discover" label="Back to Discover" />
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Discover", href: "/discover" },
              { label: a.name, href: canonicalUrl, isCurrent: true },
            ]}
            className="py-1 px-0 text-xs text-olive/60"
          />
        </nav>

        <article aria-label={`${a.name}, ${a.type} in ${a.region}`}>
          <DetailHero
            image={getAttractionImage(a.id, a.type)}
            imageAlt={`${a.name}, ${a.region}—${a.type} in Cyprus winter`}
            badge={
              <span className="inline-block px-3 py-1 rounded-md text-xs font-medium bg-white/25 backdrop-blur-md capitalize tracking-wide">
                {a.type === "restaurant" ? "Eat" : a.type}
              </span>
            }
            title={a.name}
            titleEl={"nameEl" in a ? a.nameEl : undefined}
            subtitle={a.region}
          />

          {/* Content */}
          <div className="space-y-10 sm:space-y-14">

            <section>
              <p className="text-olive/90 text-lg sm:text-xl leading-relaxed break-words">{a.description}</p>
            </section>

            {"culturalNote" in a && a.culturalNote && /buffer zone/i.test(a.culturalNote) && (
              <div className={`${CALLOUT.tip} ${CARD.content}`} role="note">
                <p className="text-sm font-medium text-charcoal flex items-start gap-2">
                  <span className="text-golden shrink-0" aria-hidden>⚠</span>
                  <span>Check access before you go. Buffer zone area—conditions can change. Verify with local sources or tourism info (1460).</span>
                </p>
              </div>
            )}

            {/* Highlights + Great for — quick scan */}
            <section>
              <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                Highlights
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
                <h3 className="prose-label text-olive/70 mb-1">
                  Great for
                </h3>
                <p className="text-olive/80 text-base break-words">{a.bestFor.join(" · ")}</p>
              </div>
              {isRestaurant(a) && (a.cuisine || a.priceRange) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {a.cuisine && (
                    <span className="px-3 py-1 rounded-md text-sm font-medium bg-golden/20 text-charcoal">
                      {a.cuisine}
                    </span>
                  )}
                  {a.priceRange && (
                    <span className="text-olive/70 text-sm">{a.priceRange}</span>
                  )}
                </div>
              )}
            </section>

            {/* Multi-venue: dining and shops */}
            {isRestaurant(a) && ((a.diningVenues && a.diningVenues.length > 0) || (a.shops && a.shops.length > 0)) && (
              <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80 space-y-4`}>
                {a.diningVenues && a.diningVenues.length > 0 && (
                  <div>
                    <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                      Dining
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
                    <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                      Shops
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                      {a.shops.map((s) => (
                        <li
                          key={s}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/90 border border-sand-200/80 text-olive/80"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Winery: Tasting + Book CTA early */}
            {isWinery(a) && a.tastingInfo && (
              <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80`}>
                <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                  Visit & taste
                </h2>
                <p className="text-olive/90 text-base leading-relaxed break-words">{a.tastingInfo}</p>
                {a.wineRoute && (
                  <p className="text-olive/70 text-sm mt-2 break-words">
                    Wine route: {a.wineRoute}
                  </p>
                )}
              </section>
            )}

            {/* Practical info — before booking so logistics come first */}
            {(a.openingHours || ("transport" in a && a.transport) || ("parking" in a && a.parking) || ("accessibility" in a && a.accessibility)) && (
              <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80 space-y-3`}>
                <h2 className={`text-xs font-semibold uppercase tracking-widest text-olive/70 ${SECTION.headingGap}`}>
                  Practical info
                </h2>
            {a.openingHours && (
              <p className="text-base text-olive/90 break-words"><strong>Hours:</strong> {a.openingHours}</p>
            )}
            {"transport" in a && a.transport && (
              <p className="text-base text-olive/90 break-words"><strong>Transport:</strong> {a.transport}</p>
            )}
            {"parking" in a && a.parking && (
              <p className="text-base text-olive/90 break-words"><strong>Parking:</strong> {a.parking}</p>
            )}
            {"accessibility" in a && a.accessibility && (
              <p className="text-base text-olive/90 break-words"><strong>Accessibility:</strong> {a.accessibility}</p>
            )}
              </section>
            )}

            {/* Revenue CTAs — Book, Contact, Shop */}
            {(a.type === "winery" ||
          (a.type === "village" && "bookingUrl" in a && a.bookingUrl) ||
          (a.type === "restaurant" && (a.bookingUrl || a.contactPhone)) ||
          a.contactPhone ||
          ("shopUrl" in a && a.shopUrl)) && (
          <section className={`${CARD.base} ${CARD.contentLg} ${CALLOUT.cta}`}>
            <h2 className="prose-label text-olive/70 mb-1">
              Book & contact
            </h2>
            {a.openingHours && /appointment|by appointment/i.test(String(a.openingHours)) && (
              <p className="text-sm text-olive/70 mb-4">Book ahead in winter; hours can be limited.</p>
            )}
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-3">
                {isWinery(a) && (
                  <>
                    <Link href={`/book/winery/${a.id}`} className={`gap-2 ${CTA.primaryCompact}`}>
                      Book a tasting →
                    </Link>
                    {a.bookingUrl && (
                      <a
                        href={a.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`gap-2 ${CTA.secondaryCompact}`}
                        aria-label="Book or contact on website (opens in new tab)"
                      >
                        {a.contactPhone ? "Book on website" : "Contact / book"}
                      </a>
                    )}
                  </>
                )}
                {a.type === "restaurant" && a.bookingUrl && (
                  <a
                    href={a.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`gap-2 ${CTA.primaryCompact}`}
                    aria-label="Reserve (opens in new tab)"
                  >
                    Reserve →
                  </a>
                )}
                {a.bookingUrl && a.type === "village" && "bookingUrl" in a && (
                  <a
                    href={a.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`gap-2 ${CTA.primaryCompact}`}
                    aria-label="Find stays (opens in new tab)"
                  >
                    Find stays →
                  </a>
                )}
                {a.contactPhone && (
                  <a
                    href={`tel:${a.contactPhone}`}
                    className={`gap-2 ${CTA.secondaryCompact}`}
                    aria-label={`Call ${a.contactPhone}`}
                  >
                    Call {a.contactPhone}
                  </a>
                )}
              </div>
              {("shopUrl" in a && a.shopUrl) || (isWinery(a) && "instagramHandle" in a && a.instagramHandle) ? (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-sand-200/80">
                  <span className="sr-only">More options</span>
                  {"shopUrl" in a && a.shopUrl && (
                    <TrackOnClick event="shop_click" properties={{ partnerId: a.id }}>
                      <a
                        href={a.shopUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`gap-2 ${CTA.chipSecondary}`}
                        aria-label="Buy wine online (opens in new tab)"
                      >
                        Buy wine online
                      </a>
                    </TrackOnClick>
                  )}
                  {isWinery(a) && "instagramHandle" in a && a.instagramHandle && (
                    <a
                      href={`https://www.instagram.com/${(a as Winery).instagramHandle}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center min-h-[44px] gap-2 px-4 py-2.5 rounded-lg border border-sand-200/80 text-olive font-medium text-sm hover:border-terracotta/30 hover:bg-terracotta/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`Follow @${a.instagramHandle} on Instagram (opens in new tab)`}
                    >
                      Instagram @{a.instagramHandle}
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          </section>
        )}

            {isWinery(a) && a.signatureWines && a.signatureWines.length > 0 && (
              <section>
                <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                  Our wines
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {a.signatureWines.map((wine, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/90 border border-sand-200/80 hover:border-terracotta/20 transition-all duration-200 overflow-hidden group shadow-sm"
                    >
                  {wine.image && (
                    <div className="aspect-[3/4] relative bg-sand-100 overflow-hidden">
                      <Image
                        src={wine.image}
                        alt={`${wine.name} ${wine.variety ? `— ${wine.variety}` : ""} at ${a.name}, Cyprus winter wine`}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 180px"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-olive text-sm break-words">{wine.name}</p>
                    {wine.variety && (
                      <p className="text-xs text-olive/70 mt-0.5 break-words">{wine.variety}</p>
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

            {(a.winterTip || a.bestTimeToVisit || a.localSecret) && (
              <section className={`${CARD.base} ${CARD.contentLg} ${CALLOUT.tip} space-y-4`}>
                <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                  Local secret
                </h2>
            {a.winterTip && (
              <p className="text-olive/90 text-base leading-relaxed break-words">{a.winterTip}</p>
            )}
            {a.bestTimeToVisit && (
              <p className="text-olive/80 text-base break-words">
                <strong>Best time:</strong> {a.bestTimeToVisit}
              </p>
            )}
            {a.localSecret && (
              <p className="text-olive/90 text-base italic border-l-2 border-terracotta/30 pl-4 break-words">
                {a.localSecret}
              </p>
            )}
              </section>
            )}

            {"backstory" in a && a.backstory && (
              <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80`}>
                <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                  Backstory
                </h2>
                <p className="text-olive/90 text-base leading-relaxed break-words">{a.backstory}</p>
              </section>
            )}

            {"culturalNote" in a && a.culturalNote && !/buffer zone/i.test(a.culturalNote) && (
              <p className="text-olive/80 text-base italic break-words">
                {a.culturalNote}
              </p>
            )}

            {isWinery(a) && typeof a.latitude === "number" && typeof a.longitude === "number" && (
              <section>
                <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                  Location
                </h2>
            <div className="rounded-xl overflow-hidden border border-sand-200/80 aspect-video min-h-[200px] bg-olive/5">
              <iframe
                title={`Map: ${a.name}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${a.longitude - 0.02}%2C${a.latitude - 0.015}%2C${a.longitude + 0.02}%2C${a.latitude + 0.015}&layer=mapnik&marker=${a.latitude}%2C${a.longitude}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${a.latitude},${a.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`gap-2 mt-3 ${CTA.secondaryCompact}`}
              aria-label="Get directions (opens in new tab)"
            >
              Get directions →
            </a>
              </section>
            )}

            {getSecretsForPlace(a.id).length > 0 && (
              <section className={`${CARD.base} ${CARD.contentLg} ${CALLOUT.tip}`}>
                <h2 className={`text-xs font-semibold uppercase tracking-widest text-olive/70 ${SECTION.headingGap}`}>
                  Local secrets
                </h2>
                <p className="text-sm text-olive/70 mb-4">
                  Insider tips for this place. From people who live here.
                </p>
                <div className="space-y-4">
                  {getSecretsForPlace(a.id).map((s) => (
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
              </section>
            )}

            {a.combineWith && a.combineWith.length > 0 && (
              <RelatedPlacesBlock
                ids={a.combineWith}
                description="Pair with trails, villages, or wineries nearby. Morning here, afternoon elsewhere, or the other way around."
                showAddToItinerary
              />
            )}

            {(() => {
              const similar = getSimilarDiscoverPlaces(a.id, a.type, a.region);
              if (similar.length === 0) return null;
              const typeLabel =
                a.type === "winery" ? "Wineries" :
                a.type === "restaurant" ? "Eat & drink" :
                a.type === "beach" ? "Beaches" :
                a.type === "ancient" ? "Ancient sites" :
                a.type === "village" ? "Villages" :
                a.type === "monastery" ? "Monasteries" :
                a.type === "nature" ? "Nature & coasts" :
                "Places";
              return (
                <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90`}>
                  <h2 className={`prose-label text-olive/70 ${SECTION.headingGap}`}>
                    More {typeLabel.toLowerCase()} in {a.region}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {similar.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={r.href}
                          className="inline-flex items-center min-h-[44px] gap-1.5 px-4 py-2.5 rounded-lg bg-sand-100/80 border border-sand-200/80 text-olive font-medium text-sm hover:text-terracotta-muted hover:border-terracotta/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {r.name} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })()}

            <footer className="pt-8 pb-4 border-t border-sand-200/80 flex flex-col sm:flex-row sm:items-center gap-4 relative" aria-label="Place actions">
              <div id="add-to-plan-sentinel" aria-hidden className="h-px absolute top-0 left-0 right-0 pointer-events-none" />
              <p className="text-olive/70 text-sm break-words">
                Add this place to your plan and pair it with a trail or village nearby.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {(() => {
                  const place = getPlaceById(a.id);
                  return place ? <NavigateButton place={place} /> : null;
                })()}
                <TrackOnClick event="plan_add" properties={{ placeId: a.id, placeType: a.type }}>
                  <AddToItineraryButton placeId={a.id} className="sm:shrink-0" />
                </TrackOnClick>
              </div>
            </footer>
          </div>
        </article>
        <StickyAddToPlanBar placeId={a.id} sentinelId="add-to-plan-sentinel" />
      </div>
    </div>
  );
}

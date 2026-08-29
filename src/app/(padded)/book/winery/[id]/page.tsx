import type { Metadata } from "next";
import { wineries } from "@/data/wineries";
import { getPlaceById } from "@/data/index";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { toSafeJsonForScript } from "@/lib/json-script";
import BookWineryBackLink from "@/components/BookWineryBackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import AppLink from "@/components/AppLink";
import { notFound } from "next/navigation";
import Image from "next/image";
import WineryBookingForm from "./WineryBookingForm";
import { getLocale, getTranslations } from "next-intl/server";
import { getAttractionImage } from "@/lib/cyprus-images";
import { applyPartnerOpeningHours } from "@/lib/partner-overlay";
import { isPartnerVerified } from "@/lib/partner-verification";

export function generateStaticParams() {
  return wineries.map((w) => ({ id: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "book.pages.wineryDetail" });
  const winery = wineries.find((w) => w.id === id);
  if (!winery) notFound();
  const imageUrl = getAttractionImage(id, "winery");
  const title = t("meta.title", { wineryName: winery.name });
  const description = t("meta.description", { wineryName: winery.name, region: winery.region });
  const alternates = buildStrategyAAlternates(`/book/winery/${id}`);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
      images: [{ url: imageUrl, width: 800, height: 600, alt: winery.name }],
    },
  };
}

export default async function WineryBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = wineries.find((w) => w.id === id);
  if (!found) notFound();
  const winery = applyPartnerOpeningHours(found);
  const imageUrl = getAttractionImage(id, "winery");
  const [tNav, tCommon, tBookPages] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("book.pages"),
  ]);

  const canonicalUrl = `${SITE_URL}/book/winery/${id}`;

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className={`flex flex-col gap-1 ${SECTION.headingGap}`} aria-label={tBookPages("pageNavAria")}>
        <BookWineryBackLink wineryId={id} wineryName={winery.name} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("discover"), href: "/discover" },
            { label: winery.name, href: `/discover/${id}` },
            { label: tCommon("breadcrumbs.bookTasting"), href: canonicalUrl, isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <div className="mt-6">
        <div className="mb-5 rounded-xl overflow-hidden border border-sand-200/80 relative h-40 sm:h-52">
            <Image
              src={imageUrl}
              alt={winery.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 600px"
              priority
              fetchPriority="high"
            />
          </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-terracotta/20 text-terracotta">
            {tCommon("wineTasting")}
          </span>
          {isPartnerVerified(winery) && (
            <span
              className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/20 text-aegean"
              title={tCommon("verifiedPartnerTitle")}
            >
              {tCommon("verifiedPartner")}
            </span>
          )}
        </div>
        <h1 className={`${TYPE.pageTitle} mt-3`}>
          {tCommon("bookTasting")}
        </h1>
        <p className="text-olive/80 mt-1 break-words">{winery.name} · {winery.region}</p>
        {winery.bestFor && winery.bestFor.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {winery.bestFor.slice(0, 4).map((tag) => (
              <span key={tag} className="inline-block px-2 py-0.5 rounded-md text-xs bg-sand-200/80 text-olive/70">
                {tag}
              </span>
            ))}
          </div>
        )}
        {winery.tastingInfo && (
          <div className="mt-3 p-3 rounded-lg border border-sand-200/80 bg-white/70">
            <p className="text-sm text-olive/80 break-words prose-body">{winery.tastingInfo}</p>
          </div>
        )}
        {winery.winterTip && (
          <div className="mt-3 p-3 rounded-lg border border-golden/30 bg-golden/5">
            <p className="text-sm text-olive/85 break-words">
              <span className="font-semibold text-olive">{tBookPages("wineryDetail.winterTip.heading")}:</span>{" "}
              {winery.winterTip}
            </p>
          </div>
        )}
        {winery.bestTimeToVisit && (
          <p className="text-sm text-olive/70 mt-2 break-words">
            <strong className="text-olive/85">{tBookPages("wineryDetail.bestTime.label")}</strong>{" "}
            {winery.bestTimeToVisit}
          </p>
        )}
        {winery.signatureWines && winery.signatureWines.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-olive mb-2">{tBookPages("wineryDetail.signatureWines.heading")}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {winery.signatureWines.map((wine) => (
                <div key={wine.name} className="shrink-0 w-36 rounded-lg border border-sand-200/80 bg-white/70 p-2.5 snap-start">
                  {wine.image && (
                    <div className="relative h-20 rounded-md overflow-hidden mb-2">
                      <Image src={wine.image} alt={wine.name} fill className="object-cover" sizes="144px" />
                    </div>
                  )}
                  <p className="text-xs font-medium text-olive truncate">{wine.name}</p>
                  {wine.variety && <p className="text-xs text-olive/60 truncate">{wine.variety}</p>}
                  {wine.price && <p className="text-xs font-medium text-terracotta mt-0.5">{wine.price}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-sm text-olive/70 mt-3 max-w-lg break-words prose-body">
          {tBookPages("wineryDetail.intro")}
        </p>
        <p className="text-xs text-olive/60 mt-2 break-words">
          {tBookPages("wineryDetail.disclaimer")}
        </p>
      </div>

      <WineryBookingForm
        wineryId={winery.id}
        wineryName={winery.name}
        openingHours={winery.openingHours}
        bestTimeToVisit={winery.bestTimeToVisit}
      />

      {(winery.openingHours || winery.transport || winery.parking) && (
        <div className="mt-6 rounded-lg border border-sand-200/70 bg-sand-100/60 p-4 space-y-2 text-sm text-olive/75">
          {winery.openingHours && (
            <p><strong className="text-olive/90">{tBookPages("wineryDetail.practical.hours")}</strong> {winery.openingHours}</p>
          )}
          {winery.transport && (
            <p><strong className="text-olive/90">{tBookPages("wineryDetail.practical.transport")}</strong> {winery.transport}</p>
          )}
          {winery.parking && (
            <p><strong className="text-olive/90">{tBookPages("wineryDetail.practical.parking")}</strong> {winery.parking}</p>
          )}
        </div>
      )}

      {(winery.bookingUrl || winery.contactPhone) && (
        <section className={`${SECTION.blockTop} space-y-4`} aria-label={tBookPages("otherWaysAria")}>
          {winery.bookingUrl && (
            <p className="text-sm text-olive/80">
              {tBookPages("wineryDetail.other.or")}{" "}
              <a
                href={winery.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta font-medium hover:underline hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
                aria-label={tBookPages("wineryDetail.other.bookDirectAria")}
              >
                {tBookPages("wineryDetail.other.bookDirectCta")}
              </a>
              {" "}{tBookPages("wineryDetail.other.bookDirectSuffix")}
            </p>
          )}
          {winery.contactPhone && (
            <p className="text-sm text-olive/70">
              {tBookPages("wineryDetail.other.callPrefix")}{" "}
              <a href={`tel:${winery.contactPhone}`} className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta hover:underline font-medium hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2">
                {winery.contactPhone}
              </a>
              {" "}{tBookPages("wineryDetail.other.callSuffix")}
            </p>
          )}
        </section>
      )}

      {winery.galleryImages && winery.galleryImages.length > 0 && (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 snap-x">
          {winery.galleryImages.map((img, i) => (
            <div key={i} className="shrink-0 w-32 h-24 rounded-lg overflow-hidden relative snap-start">
              <Image src={img} alt={`${winery.name} gallery ${i + 1}`} fill className="object-cover" sizes="128px" />
            </div>
          ))}
        </div>
      )}

      {winery.instagramHandle && (
        <p className="mt-4 text-sm">
          <a
            href={`https://instagram.com/${winery.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[44px] py-2 px-3 rounded-md text-terracotta font-medium hover:underline hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
            aria-label={tBookPages("wineryDetail.instagram.aria", { name: winery.name })}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            {tBookPages("wineryDetail.instagram.follow")}
          </a>
        </p>
      )}

      {winery.combineWith && winery.combineWith.length > 0 && (() => {
        const nearby = winery.combineWith
          .map((cid) => getPlaceById(cid))
          .filter((p): p is NonNullable<typeof p> => p != null)
          .slice(0, 3);
        if (nearby.length === 0) return null;
        return (
          <section className="mt-8" aria-label={tBookPages("wineryDetail.combineWith.heading")}>
            <h2 className="text-sm font-semibold text-olive mb-3">{tBookPages("wineryDetail.combineWith.heading")}</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {nearby.map((place) => (
                <AppLink
                  key={place.id}
                  href={`/discover/${place.id}`}
                  className="block rounded-lg border border-sand-200/80 bg-white/70 p-3 hover:border-terracotta/30 transition-colors"
                >
                  <p className="text-sm font-medium text-olive">{place.name}</p>
                  <p className="text-xs text-olive/60 mt-0.5">{place.region}</p>
                </AppLink>
              ))}
            </div>
          </section>
        );
      })()}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonForScript({
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            name: winery.name,
            description: winery.tastingInfo || winery.description,
            address: {
              "@type": "PostalAddress",
              addressRegion: winery.region,
              addressCountry: "CY",
            },
            ...(imageUrl ? { image: imageUrl } : {}),
            ...(winery.contactPhone ? { telephone: winery.contactPhone } : {}),
            ...(winery.openingHours ? { openingHours: winery.openingHours } : {}),
            ...(winery.latitude && winery.longitude ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: winery.latitude,
                longitude: winery.longitude,
              },
            } : {}),
            url: canonicalUrl,
            priceRange: tBookPages("wineryDetail.jsonLd.priceRange"),
          }),
        }}
      />
    </div>
  );
}

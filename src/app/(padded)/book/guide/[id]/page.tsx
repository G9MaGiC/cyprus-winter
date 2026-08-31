import type { Metadata } from "next";
import { guides } from "@/data/guides";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { toSafeJsonForScript } from "@/lib/json-script";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import GuideBookingForm from "./GuideBookingForm";
import GuidePartnerMeta from "@/components/guides/GuidePartnerMeta";
import { getLocale, getTranslations } from "next-intl/server";
import { isPartnerVerified } from "@/lib/partner-verification";

export function generateStaticParams() {
  return guides.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "book.pages.guideDetail" });
  const guide = guides.find((g) => g.id === id);
  if (!guide) notFound();
  const title = t("meta.title", { guideName: guide.name });
  const description = t("meta.description", { guideName: guide.name, region: guide.region });
  const alternates = buildStrategyAAlternates(`/book/guide/${id}`);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
    },
  };
}

export default async function GuideBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ trail?: string }>;
}) {
  const { id } = await params;
  const { trail } = await searchParams;
  const guide = guides.find((g) => g.id === id);
  if (!guide) notFound();
  const [tNav, tCommon, tBookPages, tGuidesDir] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("book.pages"),
    getTranslations("guides.directory"),
  ]);

  const canonicalUrl = `${SITE_URL}/book/guide/${id}`;
  const imageUrl =
    guide.image &&
    (guide.image.startsWith("http://") || guide.image.startsWith("https://")
      ? guide.image
      : `${SITE_URL}${guide.image.startsWith("/") ? "" : "/"}${guide.image}`);

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className={`flex flex-col gap-1 ${SECTION.headingGap}`} aria-label={tBookPages("pageNavAria")}>
        <BackLink href="/book/guide" label={tCommon("backTo", { label: tCommon("breadcrumbs.bookGuide") })} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("trails"), href: "/trails" },
            { label: tCommon("breadcrumbs.bookGuide"), href: "/book/guide" },
            { label: guide.name, href: `/book/guide/${id}`, isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-muted-ink"
        />
      </nav>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/10 text-aegean">
            {tBookPages("guideDetail.badge")}
          </span>
          {isPartnerVerified(guide) && (
            <span
              className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/10 text-aegean"
              title={tBookPages("guideDetail.verifiedTitle")}
            >
              {tBookPages("guideDetail.verifiedLabel")}
            </span>
          )}
        </div>
        <h1 className={`${TYPE.pageTitle} mt-3`}>{tBookPages("guideDetail.title")}</h1>
        <p className="text-muted-ink mt-1 break-words">
          {guide.name} · {guide.region}
        </p>
        <GuidePartnerMeta
          guide={guide}
          districtLabel={tGuidesDir(`districts.${guide.district}`)}
        />
        <p className="text-sm text-muted-ink mt-3 max-w-lg break-words prose-body">{guide.description}</p>
      </div>

      <GuideBookingForm guide={guide} preselectedTrailId={trail ?? undefined} />

      {(guide.bookingUrl || (guide.contactPhone && isPartnerVerified(guide))) && (
        <section className={`${SECTION.blockTop} space-y-4`} aria-label={tBookPages("otherWaysAria")}>
          {guide.bookingUrl && (
            <p className="text-sm text-muted-ink">
              {tBookPages("guideDetail.other.or")}{" "}
              <a
                href={guide.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta font-medium hover:underline hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
                aria-label={tBookPages("guideDetail.other.bookDirectAria")}
              >
                {tBookPages("guideDetail.other.bookDirectCta")}
              </a>
            </p>
          )}
          {guide.contactPhone && isPartnerVerified(guide) && (
            <p className="text-sm text-muted-ink">
              {tBookPages("guideDetail.other.callPrefix")}{" "}
              <a
                href={`tel:${guide.contactPhone}`}
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta hover:underline font-medium hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              >
                {guide.contactPhone}
              </a>{" "}
              {tBookPages("guideDetail.other.callSuffix")}
            </p>
          )}
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonForScript({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: guide.name,
            description: guide.description,
            address: {
              "@type": "PostalAddress",
              addressRegion: guide.region,
              addressCountry: "CY",
            },
            ...(imageUrl ? { image: imageUrl } : {}),
            ...(guide.contactPhone && isPartnerVerified(guide)
              ? { telephone: guide.contactPhone }
              : {}),
            ...(guide.bookingUrl ? { sameAs: [guide.bookingUrl] } : {}),
            url: canonicalUrl,
            serviceType: tBookPages("guideDetail.jsonLd.serviceType"),
            areaServed: {
              "@type": "AdministrativeArea",
              name: guide.region,
            },
          }),
        }}
      />
    </div>
  );
}

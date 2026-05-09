import type { Metadata } from "next";
import { wineries } from "@/data/wineries";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import WineryBookingForm from "./WineryBookingForm";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return wineries.map((w) => ({ id: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const winery = wineries.find((w) => w.id === id);
  if (!winery) return { title: "Not found" };
  return {
    title: `Book a tasting | ${winery.name} | Cyprus Winter`,
    description: `Book a winter tasting at ${winery.name} in ${winery.region}. Cosy fires, heaters, often the owner pouring. Confirmation by email. Book ahead. Cyprus Winter.`,
    alternates: buildStrategyAAlternates(`/book/winery/${id}`),
  };
}

export default async function WineryBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const winery = wineries.find((w) => w.id === id);
  if (!winery) notFound();
  const [tNav, tCommon, tBookPages] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("book.pages"),
  ]);

  const canonicalUrl = `${SITE_URL}/book/winery/${id}`;

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className={`flex flex-col gap-1 ${SECTION.headingGap}`} aria-label={tBookPages("pageNavAria")}>
        <BackLink href={`/discover/${id}`} label={tCommon("backTo", { label: winery.name })} />
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-terracotta/20 text-terracotta">
            {tCommon("wineTasting")}
          </span>
          {winery.isVerified && (
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
        {winery.tastingInfo && (
          <p className="text-sm text-olive/70 mt-2 break-words prose-body">{winery.tastingInfo}</p>
        )}
        <p className="text-sm text-olive/70 mt-3 max-w-lg break-words prose-body">
          {tBookPages("wineryDetail.intro")}
        </p>
        <p className="text-xs text-olive/60 mt-2 break-words">
          {tBookPages("wineryDetail.disclaimer")}
        </p>
      </div>

      <WineryBookingForm wineryId={winery.id} wineryName={winery.name} />

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
    </div>
  );
}

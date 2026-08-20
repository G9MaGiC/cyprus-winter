import { CARD, CALLOUT, CTA, TYPE } from "@/lib/design-tokens";
import { type Winery } from "@/data/wineries";
import type { Attraction } from "@/data/attractions";
import type { Restaurant } from "@/data/restaurants";
import AppLink from "@/components/AppLink";
import { TrackOnClick } from "@/components/TrackOnClick";

function isWinery(a: Attraction | Restaurant): a is Winery {
  return a.type === "winery";
}

type DetailBookingSectionProps = {
  a: Attraction | Restaurant;
  tDetail: (key: string, values?: Record<string, string>) => string;
};

export default function DetailBookingSection({ a, tDetail }: DetailBookingSectionProps) {
  const showGuideCta = a.type === "activity" || a.type === "nature";
  const shouldRender =
    showGuideCta ||
    a.type === "winery" ||
    (a.type === "village" && "bookingUrl" in a && a.bookingUrl) ||
    (a.type === "restaurant" && (a.bookingUrl || a.contactPhone)) ||
    a.contactPhone ||
    ("shopUrl" in a && a.shopUrl);

  if (!shouldRender) return null;

  return (
    <section className={`${CARD.base} ${CARD.contentLg} ${CALLOUT.cta}`}>
      <h2 className={`${TYPE.kicker} text-olive/70 mb-1`}>
        {tDetail("booking.title")}
      </h2>
      <div className="mb-4 rounded-lg border border-aegean/20 bg-aegean/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-aegean">
          {tDetail("trustTiming.title")}
        </p>
        <p className="mt-1 text-sm text-olive/80">{tDetail("trustTiming.body")}</p>
      </div>
      {isWinery(a) && (
        <p className="text-sm text-olive/60 mb-4">{tDetail("booking.alcoholDisclaimer")}</p>
      )}
      {a.openingHours && /appointment|by appointment/i.test(String(a.openingHours)) && (
        <p className="text-sm text-olive/70 mb-4">{tDetail("booking.appointmentHint")}</p>
      )}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-3">
          {showGuideCta && (
            <AppLink href="/book/guide" className={`gap-2 ${CTA.primaryCompact}`}>
              {tDetail("booking.bookGuide")}
            </AppLink>
          )}
          {isWinery(a) && (
            <>
              <AppLink href={`/book/winery/${a.id}?from=discover`} className={`gap-2 ${CTA.primaryCompact}`}>
                {tDetail("booking.bookTasting")}
              </AppLink>
              {a.bookingUrl && (
                <a
                  href={a.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`gap-2 ${CTA.secondaryCompact}`}
                  aria-label={tDetail("booking.bookOrContactAria")}
                >
                  {a.contactPhone ? tDetail("booking.bookOnWebsite") : tDetail("booking.contactBook")}
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
              aria-label={tDetail("booking.reserveAria")}
            >
              {tDetail("booking.reserveCta")}
            </a>
          )}
          {a.bookingUrl && a.type === "village" && "bookingUrl" in a && (
            <a
              href={a.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`gap-2 ${CTA.primaryCompact}`}
              aria-label={tDetail("booking.findStaysAria")}
            >
              {tDetail("booking.findStaysCta")}
            </a>
          )}
          {a.contactPhone && (
            <a
              href={`tel:${a.contactPhone}`}
              className={`gap-2 ${CTA.secondaryCompact}`}
              aria-label={tDetail("booking.callAria", { phone: a.contactPhone })}
            >
              {tDetail("booking.callCta", { phone: a.contactPhone })}
            </a>
          )}
        </div>
        {("shopUrl" in a && a.shopUrl) || (isWinery(a) && "instagramHandle" in a && a.instagramHandle) ? (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-sand-200/80">
            <span className="sr-only">{tDetail("booking.moreOptionsSr")}</span>
            {"shopUrl" in a && a.shopUrl && (
              <TrackOnClick event="shop_click" properties={{ partnerId: a.id }}>
                <a
                  href={a.shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`gap-2 ${CTA.chipSecondary}`}
                  aria-label={tDetail("booking.buyWineAria")}
                >
                  {tDetail("booking.buyWineCta")}
                </a>
              </TrackOnClick>
            )}
            {isWinery(a) && "instagramHandle" in a && a.instagramHandle && (
              <a
                href={`https://www.instagram.com/${(a as Winery).instagramHandle}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] gap-2 px-4 py-2.5 rounded-lg border border-sand-200/80 text-olive font-medium text-sm hover:border-terracotta/30 hover:bg-terracotta/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={tDetail("booking.instagramAria", { handle: a.instagramHandle })}
              >
                {tDetail("booking.instagramCta", { handle: a.instagramHandle })}
              </a>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

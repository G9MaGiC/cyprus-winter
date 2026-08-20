import AppLink from "@/components/AppLink";
import { CARD, CTA, TYPE } from "@/lib/design-tokens";
import { isCallAheadHours, placeCardHours } from "@/lib/place-card-hours";
import {
  getBookableWineriesForRoute,
  wineRouteBookHref,
} from "@/lib/wine-route-stops";
import { getTranslations } from "next-intl/server";

export default async function WineRouteBookableStops({ slug }: { slug: string }) {
  const stops = getBookableWineriesForRoute(slug);
  if (stops.length === 0) return null;

  const [tPage, tCommon] = await Promise.all([
    getTranslations("wineRoutes.page"),
    getTranslations("common"),
  ]);

  return (
    <section
      className={`${CARD.base} ${CARD.content} mb-8`}
      aria-labelledby="wine-route-bookable"
    >
      <h2 id="wine-route-bookable" className={TYPE.subSectionTitle}>
        {tPage("bookableHeading")}
      </h2>
      <p className="text-sm text-olive/80 mt-2 leading-relaxed">{tPage("bookableIntro")}</p>
      <ul className="mt-4 divide-y divide-sand-200/80">
        {stops.map((winery) => {
          const hours = placeCardHours(winery);
          return (
            <li
              key={winery.id}
              className="flex flex-col gap-3 py-4 first:pt-2 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-display text-sm sm:text-base font-semibold text-charcoal">{winery.name}</p>
                {hours ? (
                  <p className="text-xs text-aegean/90 mt-1 break-words">
                    {isCallAheadHours(hours) ? `${tCommon("callAhead")} · ` : null}
                    {hours}
                  </p>
                ) : null}
              </div>
              <AppLink
                href={wineRouteBookHref(winery.id)}
                className={`${CTA.primaryCompact} shrink-0`}
                aria-label={`${tCommon("bookTasting")} — ${winery.name}`}
              >
                {tCommon("bookTasting")}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

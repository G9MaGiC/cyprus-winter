"use client";

import Image from "next/image";
import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import NavigateButton from "@/components/NavigateButton";
import { CARD, LAYOUT, SECTION, TYPE, MEDIA } from "@/lib/design-tokens";
import { getPlaceById } from "@/data";
import { allDiscoverItems } from "@/data/discover";
import { getDiscoverPlaceOfDayPicks } from "@/lib/discover-place-of-day";
import { useTranslations } from "next-intl";

const OVERLAY_KEY_BY_TYPE: Record<string, string> = {
  winery: "quietWeek",
  village: "quietWeek",
  monastery: "quietWeek",
  nature: "clearToday",
  ancient: "bestAfternoon",
  beach: "bestAfternoon",
  restaurant: "cosyWinter",
};

function PlaceOfDayCard({
  defaultCollapsed = true,
}: {
  defaultCollapsed?: boolean;
}) {
  const t = useTranslations("discover.page.placeOfDay");
  const picks = getDiscoverPlaceOfDayPicks(allDiscoverItems);
  const place = picks[0] ?? null;
  const alsoWorth = picks.slice(1, 3);
  const planItem = place ? getPlaceById(place.id) : undefined;
  if (!place) return null;

  const overlayKey = OVERLAY_KEY_BY_TYPE[place.type] ?? "worthVisit";
  const overlayLabels: Record<string, string> = {
    quietWeek: t("overlays.quietWeek"),
    clearToday: t("overlays.clearToday"),
    bestAfternoon: t("overlays.bestAfternoon"),
    cosyWinter: t("overlays.cosyWinter"),
    worthVisit: t("overlays.worthVisit"),
  };
  const overlay = overlayLabels[overlayKey] ?? overlayLabels.worthVisit;

  const card = (
    <div
      className={`rounded-2xl overflow-hidden ${CARD.planCombo} ${CARD.interactive} group flex flex-col sm:flex-row`}
    >
      <AppLink
        href={place.href}
        className="block sm:w-2/5 shrink-0 relative aspect-[4/3] sm:aspect-square"
        aria-label={t("openAria", { name: place.name })}
      >
        <Image
          src={place.image}
          alt={place.imageAlt}
          fill
          className={MEDIA.hoverImage}
          sizes="(max-width: 640px) 100vw, 40vw"
        />
        <div className={CARD.mediaOverlay} aria-hidden />
        <span className="absolute bottom-4 start-4 end-4 text-white text-sm font-medium drop-shadow-lg">
          {overlay}
        </span>
        <span
          className={`absolute top-4 end-4 px-3 py-1.5 rounded-lg ${TYPE.kicker} bg-white/95 backdrop-blur-sm text-charcoal`}
        >
          {t("badge")}
        </span>
      </AppLink>
      <div className={`flex-1 flex flex-col ${CARD.content} justify-between`}>
        <div>
          <AppLink
            href={place.href}
            className={`${TYPE.subSectionTitleLg} text-charcoal group-hover:text-terracotta transition-colors block min-h-[44px] py-1`}
          >
            {place.name}
          </AppLink>
          <p className="text-sm text-olive/90 mt-2 leading-relaxed">{place.tease}</p>
          {place.pairWith && (
            <p className="text-sm text-olive/80 mt-3">
              {t("pairWith")}{" "}
              <AppLink href={place.pairWith.href} className={`font-medium ${SECTION.aegeanLink}`}>
                {place.pairWith.name}
              </AppLink>
            </p>
          )}
          {alsoWorth.length > 0 && (
            <p className="text-sm text-olive/80 mt-3">
              {t("alsoWorth")}{" "}
              {alsoWorth.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ", "}
                  <AppLink href={p.href} className={`font-medium ${SECTION.aegeanLink}`}>
                    {p.name}
                  </AppLink>
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {planItem && <NavigateButton place={planItem} />}
          <AddToItineraryButton placeId={place.id} label={t("addToPlan")} />
          <AppLink
            href={place.href}
            className="text-sm font-medium text-terracotta hover:text-terracotta-muted transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            {t("seeDetails")}
          </AppLink>
        </div>
      </div>
    </div>
  );

  if (!defaultCollapsed) {
    return (
      <section
        aria-labelledby="discover-place-of-day-heading"
        className={`${LAYOUT.safeAreaX} pb-2`}
      >
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2
            id="discover-place-of-day-heading"
            className={`${TYPE.kicker} text-olive/70 ${SECTION.headingGap}`}
          >
            {t("kicker")}
          </h2>
          {card}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="discover-place-of-day-heading"
      className={`${LAYOUT.safeAreaX} pb-2`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <details className="group rounded-2xl border border-sand-200/80 bg-white/70 shadow-sm open:shadow-md open:bg-white/90 transition-shadow">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 sm:p-5 text-left select-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sand min-h-[48px]">
            <div className="min-w-0">
              <p id="discover-place-of-day-heading" className="font-display text-lg font-semibold text-charcoal">
                {t("collapsibleTitle")}
              </p>
              <p className="text-xs text-olive/60 mt-0.5">{t("collapsibleSubtitle")}</p>
            </div>
            <span className="text-olive/45 group-open:rotate-180 transition-transform shrink-0" aria-hidden>
              ▾
            </span>
          </summary>
          <div className="border-t border-sand-200/60 px-3 pb-4 pt-3 sm:px-4 sm:pb-5">{card}</div>
        </details>
      </div>
    </section>
  );
}

export default function DiscoverPlaceOfDay() {
  return <PlaceOfDayCard defaultCollapsed />;
}

"use client";

import Image from "next/image";
import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import NavigateButton from "@/components/NavigateButton";
import { CARD, LAYOUT, SECTION, TYPE, MEDIA } from "@/lib/design-tokens";
import { getPlaceById } from "@/data";
import { getTrailPlaceOfDayPick } from "@/lib/trail-place-of-day";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/lib/localize";

export default function TrailsPlaceOfDay() {
  const locale = useLocale();
  const tTrails = useTranslations("trails");
  const place = getTrailPlaceOfDayPick();
  const planItem = place ? getPlaceById(place.id) : undefined;
  if (!place) return null;

  return (
    <section
      aria-labelledby="trails-place-of-day-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2
          id="trails-place-of-day-heading"
          className={`${TYPE.kicker} text-muted-ink ${SECTION.headingGap}`}
        >
          {tTrails("placeOfDay.heading")}
        </h2>
        <div
          className={`rounded-2xl overflow-hidden ${CARD.planCombo} ${CARD.interactive} group flex flex-col sm:flex-row`}
        >
          <AppLink
            href={place.href}
            className="block sm:w-2/5 shrink-0 relative aspect-[4/3] sm:aspect-square"
            aria-label={tTrails("placeOfDay.openAria", { name: getLocalizedName(place, locale) })}
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
              {place.overlayKey === "openWithTemp" && place.temperatureC != null
                ? tTrails("placeOfDay.overlay.openWithTemp", { temp: place.temperatureC })
                : tTrails(`placeOfDay.overlay.${place.overlayKey}`)}
            </span>
            <span className={`absolute top-4 end-4 px-3 py-1.5 rounded-lg ${TYPE.kicker} bg-white/95 backdrop-blur-sm text-charcoal`}>
              {tTrails("placeOfDay.badge")}
            </span>
          </AppLink>
          <div className={`flex-1 flex flex-col ${CARD.content} justify-between`}>
            <div>
              <AppLink
                href={place.href}
                className={`${TYPE.subSectionTitleLg} text-charcoal group-hover:text-terracotta transition-colors block min-h-[44px] py-1`}
              >
                {getLocalizedName(place, locale)}
              </AppLink>
              <p className="text-sm text-olive/90 mt-2 leading-relaxed">
                {place.tease}
              </p>
              {place.pairWith && (
                <p className="text-sm text-muted-ink mt-3">
                  {tTrails("placeOfDay.pairWith")}{" "}
                  <AppLink
                    href={place.pairWith.href}
                    className={`font-medium ${SECTION.aegeanLink}`}
                  >
                    {getLocalizedName(place.pairWith, locale)}
                  </AppLink>
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {planItem && <NavigateButton place={planItem} />}
              <AddToItineraryButton placeId={place.id} label={tTrails("addToPlan")} />
              <AppLink
                href={place.href}
                className="text-sm font-medium text-terracotta hover:text-terracotta-muted transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                {tTrails("placeOfDay.seeDetails")}
              </AppLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

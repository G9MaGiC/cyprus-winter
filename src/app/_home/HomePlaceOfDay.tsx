"use client";

import Image from "next/image";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import AppLink from "@/components/AppLink";
import NavigateButton from "@/components/NavigateButton";
import { CARD, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { allPlaces, getAttractionById, getPlaceById } from "@/data";
import { getAttractionImage, getTrailImage } from "@/lib/cyprus-images";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { trails } from "@/data/trails";
import { useTranslations } from "next-intl";

const PLACE_TYPES = ["attraction", "trail", "winery"] as const;

function getPlaceOfDayData(overlays: {
  goodDay: string;
  quietWeek: string;
  clearToday: string;
  bestAfternoon: string;
  worthVisit: string;
}) {
  const candidates = allPlaces.filter((p) =>
    PLACE_TYPES.includes(p.type as (typeof PLACE_TYPES)[number])
  );
  if (candidates.length === 0) return null;

  const picked = pickDailyWithKey(candidates, "place-of-day");

  if (picked.type === "trail") {
    const trail = trails.find((tr) => tr.id === picked.id);
    if (!trail) return null;
    const tease =
      trail.winterNotes ||
      trail.description.split(".")[0] + "." ||
      "Check reports before you go.";
    return {
      id: picked.id,
      name: picked.name,
      region: picked.region,
      href: `/trails/${picked.id}`,
      image: getTrailImage(picked.id),
      imageAlt: `${picked.name}, ${picked.region} — Troodos trail`,
      tease: tease.length > 100 ? tease.slice(0, 97) + "…" : tease,
      overlay: overlays.goodDay,
    };
  }

  const att = getAttractionById(picked.id);
  if (!att) return null;

  const desc = att.description;
  const fallbackByType: Record<string, string> = {
    winery: "Heaters on the terrace.",
    village: "Cobbles to yourself midweek.",
    monastery: "Quiet this week.",
    nature: "Clear today.",
    ancient: "Best light in afternoon.",
    beach: "Quiet in winter.",
  };
  const tease =
    att.winterTip ||
    desc.split(".")[0] + "." ||
    fallbackByType[att.type] ||
    `${att.region}. Worth a visit.`;
  const shortTease = tease.length > 100 ? tease.slice(0, 97) + "…" : tease;

  const overlayByType: Record<string, string> = {
    winery: overlays.quietWeek,
    village: overlays.quietWeek,
    monastery: overlays.quietWeek,
    nature: overlays.clearToday,
    ancient: overlays.bestAfternoon,
    beach: overlays.bestAfternoon,
  };

  return {
    id: picked.id,
    name: picked.name,
    region: picked.region,
    href: `/discover/${picked.id}`,
    image: getAttractionImage(picked.id, att.type),
    imageAlt: `${picked.name}, ${picked.region} — Cyprus winter`,
    tease: shortTease,
    overlay: overlayByType[att.type] ?? overlays.worthVisit,
  };
}

export default function HomePlaceOfDay() {
  const t = useTranslations("home.placeOfDay");
  const Link = AppLink;
  const place = getPlaceOfDayData({
    goodDay: t("overlays.goodDay"),
    quietWeek: t("overlays.quietWeek"),
    clearToday: t("overlays.clearToday"),
    bestAfternoon: t("overlays.bestAfternoon"),
    worthVisit: t("overlays.worthVisit"),
  });
  const planItem = place ? getPlaceById(place.id) : undefined;
  if (!place) return null;

  return (
    <section
      id="place-of-day"
      aria-labelledby="place-of-day-heading"
      className={`${SECTION.pySub} bg-background ${LAYOUT.safeAreaX} scroll-mt-24`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <div
          className={`rounded-2xl overflow-hidden ${CARD.base} ${CARD.featured} ${CARD.hover} ${CARD.interactive} group flex flex-col sm:flex-row`}
        >
          <Link
            href={place.href}
            prefetch="auto"
            className="block sm:w-2/5 shrink-0 relative aspect-[4/3] sm:aspect-square"
            aria-label={t("openAria", { name: place.name })}
          >
            <Image
              src={place.image}
              alt={place.imageAlt}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
            <div className={CARD.mediaOverlay} aria-hidden />
            <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium drop-shadow-lg">
              {place.overlay}
            </span>
          </Link>
          <div className={`flex-1 flex flex-col ${CARD.contentLg}`}>
            <p id="place-of-day-heading" className={`${TYPE.kicker} mb-1`}>
              {t("kicker")}
            </p>
            <Link
              href={place.href}
              prefetch="auto"
              className={`${TYPE.subSectionTitle} text-charcoal group-hover:text-terracotta transition-colors mt-0.5`}
            >
              {place.name}
            </Link>
            <p className="text-sm text-olive/90 mt-1 leading-relaxed flex-1">
              {place.tease}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              {planItem && <NavigateButton place={planItem} />}
              <AddToItineraryButton placeId={place.id} label={t("addToPlan")} />
              <Link
                href={place.href}
                prefetch="auto"
                className="text-sm font-medium text-terracotta hover:text-terracotta-muted hover:underline underline-offset-2 transition-colors min-h-[44px] inline-flex items-center"
              >
                {t("seeDetails")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

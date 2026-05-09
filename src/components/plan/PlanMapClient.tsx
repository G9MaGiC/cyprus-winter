"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useItinerary, MAX_DAYS } from "@/hooks/useItinerary";
import { getPlaceCoords } from "@/lib/place-coords";
import type { PlanMapItem } from "./PlanMap";
import { useTranslations } from "next-intl";

function PlanMapLoading() {
  const tCommon = useTranslations("common");
  return (
    <div
      className="min-h-[280px] rounded-xl border border-sand-200/80 bg-sand-100/80 flex items-center justify-center animate-pulse"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-olive/60">{tCommon("loading.map")}</p>
    </div>
  );
}

const PlanMap = dynamic(() => import("./PlanMap").then((m) => m.default), {
  ssr: false,
  loading: () => <PlanMapLoading />,
});

export default function PlanMapClient() {
  const { days, hydrated, getPlace } = useItinerary();

  const items = useMemo((): PlanMapItem[] => {
    if (!hydrated || !days) return [];
    const result: PlanMapItem[] = [];
    for (let day = 1; day <= MAX_DAYS; day++) {
      const ids = days[day] ?? [];
      for (const id of ids) {
        const place = getPlace(id);
        if (!place) continue;
        const coords = getPlaceCoords(place);
        if (!coords) continue;
        const href =
          place.type === "trail"
            ? `/trails/${place.id}`
            : place.type === "event"
              ? "/events"
              : `/discover/${place.id}`;
        result.push({
          id: place.id,
          name: place.name,
          region: place.region,
          lat: coords.lat,
          lng: coords.lng,
          href,
          day,
        });
      }
    }
    return result;
  }, [hydrated, days, getPlace]);

  const hasContent = days ? Object.values(days).flat().length > 0 : false;

  if (!hydrated) return null;
  if (items.length === 0 && !hasContent) return null;
  if (items.length === 0 && hasContent) {
    return (
      <p className="text-sm text-olive/70 py-6 rounded-xl border border-sand-200/80 bg-sand-100/50 text-center">
        Some of your places don&apos;t have map locations yet.
      </p>
    );
  }

  return <PlanMap items={items} className="w-full" />;
}

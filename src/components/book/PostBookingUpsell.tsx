"use client";

import AppLink from "@/components/AppLink";
import { useTranslations } from "next-intl";
import { CARD, TYPE, CTA } from "@/lib/design-tokens";

type NearbyPlace = {
  id: string;
  name: string;
  type: string;
  reason: string;
};

export default function PostBookingUpsell({
  region,
  excludeId,
}: {
  region: string;
  excludeId: string;
}) {
  const t = useTranslations("book.upsell");

  // Static suggestions based on region — avoids importing heavy data modules client-side
  const suggestions = getRegionSuggestions(region, excludeId);
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-olive mb-3">{t("title")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {suggestions.map((place) => (
          <AppLink
            key={place.id}
            href={place.type === "trail" ? `/trails/${place.id}` : `/discover/${place.id}`}
            className={`${CARD.base} ${CARD.hover} p-4 group block`}
          >
            <p className={TYPE.cardTitleCompact}>{place.name}</p>
            <p className="text-xs text-sage mt-1">{place.reason}</p>
          </AppLink>
        ))}
      </div>
      <div className="text-center mt-4">
        <AppLink href="/discover" className={`${CTA.secondaryCompact} text-xs`}>
          {t("browseMore")}
        </AppLink>
      </div>
    </div>
  );
}

function getRegionSuggestions(region: string, excludeId: string): NearbyPlace[] {
  const regionMap: Record<string, NearbyPlace[]> = {
    Limassol: [
      { id: "kourion", name: "Ancient Kourion", type: "place", reason: "Cliffside amphitheatre, 20 min drive" },
      { id: "kolossi-castle", name: "Kolossi Castle", type: "place", reason: "Medieval fortress nearby" },
      { id: "caledonia-waterfalls", name: "Caledonia Waterfalls", type: "trail", reason: "A gentle forest walk to a waterfall" },
    ],
    Paphos: [
      { id: "tombs-of-the-kings", name: "Tombs of the Kings", type: "place", reason: "UNESCO site, 10 min walk" },
      { id: "aphrodite-trail", name: "Aphrodite Trail", type: "trail", reason: "Coastal walk with sea views" },
      { id: "coral-bay", name: "Coral Bay", type: "place", reason: "Sandy beach, calm in winter" },
    ],
    Troodos: [
      { id: "artemis", name: "Artemis Trail", type: "trail", reason: "Summit loop with panoramic views" },
      { id: "omodos", name: "Omodos Village", type: "place", reason: "Wine village with cobbled streets" },
      { id: "kykkos-monastery", name: "Kykkos Monastery", type: "place", reason: "Cyprus' most famous monastery" },
    ],
    Larnaca: [
      { id: "hala-sultan-tekke", name: "Hala Sultan Tekke", type: "place", reason: "Lakeside mosque and salt flats" },
      { id: "lefkara", name: "Lefkara Village", type: "place", reason: "UNESCO lace village, 30 min drive" },
      { id: "finikoudes", name: "Finikoudes Beach", type: "place", reason: "Palm-lined promenade" },
    ],
    Nicosia: [
      { id: "old-nicosia", name: "Old Nicosia", type: "place", reason: "Walled city with great cafes" },
      { id: "machairas-monastery", name: "Machairas Monastery", type: "place", reason: "Mountain monastery in pine forest" },
    ],
  };

  const suggestions = regionMap[region] ?? regionMap["Troodos"] ?? [];
  return suggestions.filter((s) => s.id !== excludeId).slice(0, 3);
}

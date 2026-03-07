/**
 * Pre-built itinerary templates: metadata + place IDs per day.
 * Used by Plan page, QuickStartSection, and URL ?template= param.
 */

export type ItineraryTemplateMeta = {
  key: string;
  label: string;
  description: string;
  duration: number;
  bestFor: string[];
  seasonalNote?: string;
  hasWineries: boolean;
  /** Place IDs by day */
  days: Record<number, string[]>;
};

export const ITINERARY_TEMPLATES: ItineraryTemplateMeta[] = [
  {
    key: "short-stay",
    label: "Short stay",
    description: "48 hours: trail, village, wine",
    duration: 2,
    bestFor: ["Bleisure", "Weekend", "Quick trip"],
    seasonalNote: "Daylight ~5pm. Start early.",
    hasWineries: true,
    days: {
      1: ["kourion", "pafos-mosaics"],
      2: ["artemis", "omodos", "tsiakkas"],
    },
  },
  {
    key: "classic",
    label: "Classic",
    description: "Coast, culture, hill villages",
    duration: 5,
    bestFor: ["Culture", "First visit"],
    hasWineries: true,
    days: {
      1: ["kourion", "pafos-mosaics"],
      2: ["artemis", "platres"],
      3: ["kykkos", "omodos"],
      4: ["lefkara", "tsiakkas"],
      5: ["adonis", "kolios"],
    },
  },
  {
    key: "mountain",
    label: "Mountain",
    description: "Troodos trails & stone villages",
    duration: 5,
    bestFor: ["Hiking", "Villages"],
    seasonalNote: "Pack layers. Trails can be icy.",
    hasWineries: true,
    days: {
      1: ["artemis", "platres"],
      2: ["atalante", "omodos"],
      3: ["caledonia-falls", "kakopetria"],
      4: ["kykkos", "tsiakkas"],
      5: ["persephone", "pedoulas"],
    },
  },
  {
    key: "coast-culture",
    label: "Coast & Culture",
    description: "Beaches, ruins, wine",
    duration: 5,
    bestFor: ["Beaches", "History", "Wine"],
    hasWineries: true,
    days: {
      1: ["pafos-mosaics", "tomb-of-kings"],
      2: ["adonis", "kolios"],
      3: ["kourion", "governors-beach"],
      4: ["lefkara", "cape-greco"],
      5: ["omodos", "tsiakkas"],
    },
  },
  {
    key: "family",
    label: "Family",
    description: "Gentle pace, 2–3 stops a day",
    duration: 5,
    bestFor: ["Families", "Kids"],
    hasWineries: true,
    days: {
      1: ["fig-tree-bay", "coral-bay"],
      2: ["choirokoitia", "lefkara"],
      3: ["caledonia-falls", "kakopetria"],
      4: ["artemis", "platres"],
      5: ["sterna-boutique", "pafos-mosaics"],
    },
  },
  {
    key: "classic-7",
    label: "Classic Culture (7 days)",
    description: "Larnaca to Paphos: coasts, cities, Troodos",
    duration: 7,
    bestFor: ["Culture", "First visit", "1-week trip"],
    seasonalNote: "Dec: Christmas villages. Jan: Almond blossoms.",
    hasWineries: true,
    days: {
      1: ["fig-tree-bay", "larnaca-salt-lake"],
      2: ["leventis-museum", "cyprus-museum"],
      3: ["kykkos", "platres", "omodos"],
      4: ["pafos-mosaics", "tomb-of-kings"],
      5: ["adonis", "polis"],
      6: ["kourion", "kolios"],
      7: ["governors-beach", "lefkara"],
    },
  },
  {
    key: "mountain-10",
    label: "Mountain Explorer (10 days)",
    description: "Troodos base, Pitsilia, Machairas, Paphos",
    duration: 10,
    bestFor: ["Hiking", "Deep immersion"],
    seasonalNote: "Jan–Mar: Snow possible on Olympus. Check trail conditions.",
    hasWineries: true,
    days: {
      1: ["artemis", "platres"],
      2: ["atalante", "omodos"],
      3: ["caledonia-falls", "kakopetria"],
      4: ["kykkos", "tsiakkas"],
      5: ["persephone", "pedoulas"],
      6: ["machairas-forest", "machairas"],
      7: ["vouni-panayia", "lofou"],
      8: ["pafos-mosaics", "tomb-of-kings"],
      9: ["adonis", "coral-bay"],
      10: ["kourion", "governors-beach"],
    },
  },
];

/** Legacy shape for useItinerary compatibility */
export function getTemplateDays(key: string): Record<number, string[]> | undefined {
  const t = ITINERARY_TEMPLATES.find((x) => x.key === key);
  return t?.days;
}

export const TEMPLATE_KEYS = ITINERARY_TEMPLATES.map((t) => t.key);
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

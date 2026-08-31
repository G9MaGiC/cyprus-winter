/**
 * Pre-built itinerary templates: metadata + place IDs per day.
 * Designed by Cyprus tour-operator expertise: realistic pacing, seasonal tips, winery bookings.
 * Used by Plan page, QuickStartSection, and URL ?template= param.
 */

export type ItineraryTemplateMeta = {
  key: string;
  label: string;
  description: string;
  duration: number;
  bestFor: string[];
  /** Tour operator tip: pacing, driving, or booking */
  seasonalNote?: string;
  /** Booking or logistics reminder when relevant */
  bookingNote?: string;
  hasWineries: boolean;
  /** Place IDs by day */
  days: Record<number, string[]>;
};

export const ITINERARY_TEMPLATES: ItineraryTemplateMeta[] = [
  {
    key: "short-stay",
    label: "Short stay",
    description: "48 hours: ancient coast, Troodos trail, village wine",
    duration: 2,
    bestFor: ["Bleisure", "Weekend", "Stopover"],
    seasonalNote: "Daylight ends ~5pm. Start Kourion by 10am.",
    bookingNote: "Book Tsiakkas tasting—winter slots fill.",
    hasWineries: true,
    days: {
      1: ["kourion", "pafos-mosaics"],
      2: ["artemis", "omodos", "tsiakkas"],
    },
  },
  {
    key: "classic",
    label: "Classic",
    description: "Coast to mountains: Paphos ruins, Troodos trails, Lefkara lace",
    duration: 5,
    bestFor: ["Culture", "First visit", "Balanced pace"],
    seasonalNote: "2–3 stops/day. Group Kourion + mosaics (same coast).",
    bookingNote: "Reserve Tsiakkas and Kolios tastings 24–48h ahead.",
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
    description: "Troodos loops and stone villages—Artemis, Caledonia, Kykkos",
    duration: 5,
    bestFor: ["Hiking", "Villages", "Winter trails"],
    seasonalNote: "Pack layers. Trails can be icy; check conditions.",
    bookingNote: "Tsiakkas after Kykkos—perfect end-of-day pairing.",
    hasWineries: true,
    days: {
      1: ["artemis", "platres"],
      2: ["persephone", "omodos"],
      3: ["caledonia-falls", "kakopetria"],
      4: ["kykkos", "tsiakkas"],
      5: ["atalante", "pedoulas"],
    },
  },
  {
    key: "coast-culture",
    label: "Coast & Culture",
    description: "Beaches, UNESCO sites, wineries—east to west",
    duration: 5,
    bestFor: ["Beaches", "History", "Wine"],
    seasonalNote: "Gentle coast; combine Kourion + Governor's Beach (nearby).",
    bookingNote: "Book Omodos/Tsiakkas tastings; winter hours limited.",
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
    description: "Gentle pace, 2 stops/day—beaches, museums, village lunch",
    duration: 5,
    bestFor: ["Families", "Kids", "Relaxed", "Rainy-day options"],
    seasonalNote:
      "Two stops per day max. Rain? Swap day 3 for Cyprus Museum + Leventis (Nicosia)—indoor backup.",
    bookingNote: "Sterna Boutique—reserve family tasting; call 24h ahead in winter.",
    hasWineries: true,
    days: {
      1: ["fig-tree-bay", "konnos-bay"],
      2: ["choirokoitia", "lefkara"],
      3: ["caledonia-falls", "kakopetria"],
      4: ["leventis-museum", "platres"],
      5: ["sterna-boutique", "pafos-mosaics"],
    },
  },
  {
    key: "workation",
    label: "Workation week",
    description: "Remote weekdays, Troodos & coast on weekends—wifi cafés, mild weather",
    duration: 7,
    bestFor: ["Remote workers", "Slow travel", "Weekend hikers"],
    seasonalNote: "Check /weather for your month. Weekends: trails before 10am.",
    bookingNote: "Book weekend winery slots early; weekdays are quieter.",
    hasWineries: true,
    days: {
      1: ["larnaca-salt-lake", "lefkara"],
      2: ["cyprus-museum", "leventis-museum"],
      3: ["platres", "omodos"],
      4: ["artemis", "tsiakkas"],
      5: ["kourion", "governors-beach"],
      6: ["pafos-mosaics", "kolios"],
      7: ["adonis", "polis"],
    },
  },
  {
    key: "classic-7",
    label: "Classic Culture (7 days)",
    description: "Larnaca → Nicosia → Troodos → Paphos—full island sweep",
    duration: 7,
    bestFor: ["Culture", "First visit", "1-week trip"],
    seasonalNote: "Dec: Christmas villages. Jan: Almond blossoms. Start Nicosia museums early.",
    bookingNote: "Multiple winery stops—book ahead; lean staffing in winter.",
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
    description: "Troodos base, Pitsilia, Machairas, then coast—deep hiker immersion",
    duration: 10,
    bestFor: ["Hiking", "Deep immersion", "Serious trekkers"],
    seasonalNote: "Jan–Mar: Snow on Olympus. Check trail conditions daily.",
    bookingNote: "Vouni Panayia: book tasting. Days 8–10: coast wind-down.",
    hasWineries: true,
    days: {
      1: ["artemis", "platres"],
      2: ["persephone", "omodos"],
      3: ["caledonia-falls", "kakopetria"],
      4: ["kykkos", "tsiakkas"],
      5: ["atalante", "pedoulas"],
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

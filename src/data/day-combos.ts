/**
 * Curated day combos for Build a day section.
 * Morning at one place, afternoon at another — designed to flow.
 */

export type DayCombo = {
  label: string;
  /** One-line why it works — warm, practical */
  why: string;
  /** Winter tip when relevant */
  tip?: string;
  /** Place IDs in suggested order (morning → afternoon) */
  ids: string[];
};

export const DAY_COMBOS: DayCombo[] = [
  {
    label: "Trail and village",
    why: "Pine forest in the morning, village lunch by noon.",
    tip: "Start Artemis by 9am. Omodos warms up with coffee and lace.",
    ids: ["artemis", "omodos", "tsiakkas"],
  },
  {
    label: "Limassol coast & Commandaria",
    why: "Ancient theatre, quick dip, then sugar-mill wine.",
    ids: ["kourion", "governors-beach", "kolossi"],
  },
  {
    label: "Paphos mosaics & wine",
    why: "Morning light on the floors, Vouni for lunch and tasting.",
    tip: "House of Theseus: 9–11am. Book Vouni ahead.",
    ids: ["pafos-mosaics", "tomb-of-kings", "vouni-panayia"],
  },
  {
    label: "Waterfall and stone village",
    why: "Caledonia after rain, Kakopetria for lunch and cobbles.",
    tip: "Best 1–2 days after rainfall. Waterproof boots.",
    ids: ["caledonia-falls", "kakopetria"],
  },
  {
    label: "Kykkos and wine",
    why: "Monastery and views first, Tsiakkas tasting to close the loop.",
    tip: "Tsiakkas terrace has heaters. Book ahead.",
    ids: ["kykkos", "tsiakkas"],
  },
  {
    label: "Lace, ancient & wine",
    why: "Lefkara lacemakers, Choirokoitia, then Dómes Sergiou.",
    ids: ["lefkara", "choirokoitia", "domes-sergiou"],
  },
  {
    label: "Gentle trail & Platres",
    why: "Atalante loop, then Platres for kafenions and views.",
    tip: "Easiest Troodos trail. Often clear when higher trails have snow.",
    ids: ["atalante", "platres"],
  },
  {
    label: "Paphos coast & Adonis",
    why: "Tomb of Kings, coral bay stretch, Adonis for tasting.",
    ids: ["tomb-of-kings", "adonis", "kolios"],
  },
];

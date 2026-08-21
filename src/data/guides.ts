import type { TouristGuideDistrict } from "@/lib/guides-directory-types";

export type Guide = {
  id: string;
  name: string;
  region: string;
  /** Deputy Ministry district for directory cross-link and match filters. */
  district: TouristGuideDistrict;
  description: string;
  /** Languages offered (PDF tokens: english, greek, german, …). */
  languages: string[];
  /** Trail IDs this guide covers (e.g. ["artemis", "caledonia-falls"]) */
  trailIds: string[];
  /** Link to licensed directory row once a real guide opts in. */
  licensedGuideId?: string;
  image?: string;
  contactPhone?: string;
  bookingUrl?: string;
  partnerEmail?: string;
  isVerified?: boolean;
  partnerLeadFeeEur?: number;
};

export const guides: Guide[] = [
  {
    id: "cyprus-active-tours",
    name: "Cyprus Active Tours",
    region: "Troodos & Paphos",
    district: "lemesos",
    languages: ["english", "greek", "german"],
    description:
      "Winter hiking and cultural tours across Troodos and Paphos. Artemis, Caledonia Falls, Atalante—small groups, experienced leaders. They know the mountain; pack layers and let them lead.",
    trailIds: ["artemis", "caledonia-falls", "atalante", "persephone", "adonis", "aphrodite"],
    contactPhone: "+357 99 123456",
    bookingUrl: "https://www.cyprusactivetours.com/",
    isVerified: true,
    partnerEmail: "bookings+cyprus-active-tours@cyprus-winter.example",
    partnerLeadFeeEur: 10,
  },
  {
    id: "troodos-guides",
    name: "Troodos Mountain Guides",
    region: "Troodos",
    district: "lemesos",
    languages: ["english", "greek"],
    description:
      "Local mountain guides for Troodos. Artemis, Atalante, Caledonia Falls, Olympus. Winter conditions know-how. Private and small-group hikes.",
    trailIds: ["artemis", "atalante", "caledonia-falls", "olympus-summit", "madari-ridge"],
    contactPhone: "+357 25 421123",
    isVerified: true,
    partnerEmail: "bookings+troodos-guides@cyprus-winter.example",
    partnerLeadFeeEur: 10,
  },
  {
    id: "akamas-explorer",
    name: "Akamas Explorer",
    region: "Paphos & Akamas",
    district: "pafos",
    languages: ["english", "french", "german"],
    description:
      "Akamas Peninsula and Paphos coast trails. Adonis, Aphrodite, Avakas—sea views, coastal paths. Winter is the sweet spot; no summer heat.",
    trailIds: ["adonis", "aphrodite", "avakas-gorge"],
    contactPhone: "+357 26 654321",
    isVerified: true,
    partnerEmail: "bookings+akamas-explorer@cyprus-winter.example",
    partnerLeadFeeEur: 8,
  },
  {
    id: "paphos-forest-guides",
    name: "Paphos Forest Guides",
    region: "Paphos",
    district: "pafos",
    languages: ["english", "greek", "russian"],
    description:
      "Paphos forest and Akamas edge trails. Smigies, Stavros tis Psokas, Vouni Panagias—pine ridges and quiet winter paths away from the coast crowds.",
    trailIds: ["smigies", "stavros-tis-psokas", "vouni-panagias", "pissouromoutti"],
    contactPhone: "+357 26 701234",
    isVerified: true,
    partnerEmail: "bookings+paphos-forest-guides@cyprus-winter.example",
    partnerLeadFeeEur: 8,
  },
  {
    id: "platres-trail-co",
    name: "Platres Trail Co",
    region: "Troodos",
    district: "lemesos",
    languages: ["english", "greek", "polish"],
    description:
      "Platres-based guides for waterfall and forest loops. Millomeris, Kryos Potamos, Kampos tou Livadiou—ideal when higher Troodos trails are snow-lined but valleys stay walkable.",
    trailIds: ["millomeris-falls", "kryos-potamos-loop", "kampos-tou-livadiou", "horteri"],
    contactPhone: "+357 25 431567",
    isVerified: true,
    partnerEmail: "bookings+platres-trail-co@cyprus-winter.example",
    partnerLeadFeeEur: 10,
  },
  {
    id: "cape-coast-guides",
    name: "Cape & Coast Guides",
    region: "Ayia Napa & Cape Greco",
    district: "ammochostos",
    languages: ["english", "greek", "russian"],
    description:
      "East-coast coastal hiking without Troodos snow. Cape Greco coastal path, sea caves, and winter-light cliff walks. Mild temperatures; wind layer essential.",
    trailIds: ["cape-greco"],
    contactPhone: "+357 23 812345",
    isVerified: true,
    partnerEmail: "bookings+cape-coast-guides@cyprus-winter.example",
    partnerLeadFeeEur: 8,
  },
  {
    id: "nicosia-outdoor",
    name: "Nicosia Outdoor",
    region: "Nicosia",
    district: "lefkosia",
    languages: ["english", "greek", "arabic"],
    description:
      "Capital hinterland trails when Troodos is iced over. Xyliatos Dam loop, Machairas forest paths—reservoir views and pine without the mountain drive.",
    trailIds: ["xyliatos-dam", "machairas-forest"],
    contactPhone: "+357 22 901234",
    isVerified: true,
    partnerEmail: "bookings+nicosia-outdoor@cyprus-winter.example",
    partnerLeadFeeEur: 8,
  },
];

/** Resolve a guide by id. */
export function getGuideById(id: string): Guide | undefined {
  return guides.find((g) => g.id === id);
}

/** Verified partners only. */
export function getVerifiedGuides(): Guide[] {
  return guides.filter((g) => g.isVerified);
}

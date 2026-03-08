export type Guide = {
  id: string;
  name: string;
  region: string;
  description: string;
  /** Trail IDs this guide covers (e.g. ["artemis", "caledonia-falls"]) */
  trailIds: string[];
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
    description:
      "Akamas Peninsula and Paphos coast trails. Adonis, Aphrodite, Avakas—sea views, coastal paths. Winter is the sweet spot; no summer heat.",
    trailIds: ["adonis", "aphrodite", "avakas-gorge"],
    contactPhone: "+357 26 654321",
    isVerified: true,
    partnerEmail: "bookings+akamas-explorer@cyprus-winter.example",
    partnerLeadFeeEur: 8,
  },
];

/** Resolve a guide by id. */
export function getGuideById(id: string): Guide | undefined {
  return guides.find((g) => g.id === id);
}

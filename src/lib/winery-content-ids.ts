/**
 * Coverage constants for the AUD-10 winery content overlay — separate from
 * winery-content.ts so tests (and any client code) can import them without
 * pulling in the server-only overlay module.
 */

/** Covered set. Slice 1 (pilot): the six intended partner wineries
    (Book-stage converts first). Slice 2 (batch 10): the itinerary-template
    stop plus the five richest-content non-partner wineries by visitor
    relevance. Extend alongside a catalog patch — winery-content.test.ts
    guards every id × field × locale. */
// 2026-09-02 quarantine (docs/PARTNER_DATA_VERIFICATION_2026-09-02.md):
// 27 records left the public catalog, so their ids leave this registry.
// Their overlay strings stay in the locale catalogs on purpose — restoring a
// record after re-verification restores its translations with no catalog work.
export const LOCALIZED_WINERY_IDS: ReadonlySet<string> = new Set([
  // Slice 1 — partner pilot
  "tsiakkas",
  "vouni-panayia",
  "zambartas",
  "kolios",
  "domes-sergiou",
  // Slice 2 — template stop + high-relevance estates
  "sterna-boutique",
  "vlassides",
  "kyperounta",
  "vasilikon",
  "fikardos",
  "oenou-yi",
  // Slice 6 (batch 15) — next richest estates
  "mystes",
  "avakas",
  "aes-ambelis",
  "kalamos",
  "christoudia",
  // Slice 9 (batch 18) — next 10 by content richness
  "ayia-mavri",
  "makarounas",
  "argyrides",
  // Slice 10 (batch 19) — next 10 by content richness
  "sodap",
  "tsangarides",
  "silikou-museum",
  "hadjicharalambous",
  "semeli",
  // Slice 11 (batch 20) — next 10 by content richness
  "dafermou",
  "nicolaides",
  "solia",
  // Slice 12 (batch 21) — final 21 wineries; completes the class (71 of 71)
  "ezousa",
  "hadjipavlou",
  "minous",
  "ayii-anargyri",
  "pittali",
  "papaioannou",
  "karseras",
  "evangelou",
  "chrysoroyiatissa-winery",
  "loel",
  "etko-olympus",
  "revecca",
  "mallia",
  "monolithos",
  "antoniades",
  "ayios-savas",
  "anama",
]);

export const LOCALIZED_WINERY_FIELDS = [
  "tastingInfo",
  "winterTip",
  "bestTimeToVisit",
  "openingHours",
  "transport",
  "parking",
] as const;

export type LocalizedWineryField = (typeof LOCALIZED_WINERY_FIELDS)[number];

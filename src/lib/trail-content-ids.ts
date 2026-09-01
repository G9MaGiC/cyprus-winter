/**
 * Coverage constants for the AUD-10 trail content overlay — separate from
 * trail-content.ts so tests (and any client code) can import them without
 * pulling in the server-only overlay module. Mirrors winery-content-ids.ts
 * and attraction-content-ids.ts.
 */

/** Covered set. Slice 13 (batch 22): the 10 flagship winter trails by
    decision-surface content richness — the pilot for the trail class. */
export const LOCALIZED_TRAIL_IDS: ReadonlySet<string> = new Set([
  "petra-tou-romiou",
  "artemis",
  "olympus-summit",
  "caledonia-falls",
  "adonis",
  "madari-ridge",
  "atalante",
  "avakas-gorge",
  "panagia-araka-stavros",
  "cape-greco",
  // Slice 14 (batch 23) — next 12 by content richness
  "caledonia-alternative",
  "horteri",
  "millomeris-falls",
  "aphrodite",
  "almirolivado",
  "mnimata-piskopon",
  "kampos-tou-livadiou",
  "kykkos-konizi",
  "smigies",
  "trooditissa-phini",
  "kannoures-agios-nikolaos",
  "loumata-ton-aeton",
  // Slice 15 (batch 24) — next 15 by content richness
  "livadi-trail",
  "stavros-tis-psokas",
  "venetian-bridges",
  "chrysovrysi",
  "moni-fylagra",
  "aphrodite-cape-greco",
  "ezousa-valley",
  "machairas-forest",
  "vretsia-roudias",
  "persephone",
  "kryos-potamos-loop",
  "e4-troodos-platres",
  "sea-caves-anargyroi",
  "pissouromoutti",
  "chorteri",
  // Slice 16 (batch 25) — next 17 by content richness
  "agioi-anargyroi-circular",
  "kavos-trail",
  "prodromos-dam-stavroulia",
  "troodos-visitor-centre",
  "politiko-machairas",
  "symvoulas",
  "ariadni",
  "prodromos-zoumi",
  "vavatsinia-honeybee",
  "vouni-panagias",
  "agia-varvara-stavrovouni",
  "konnoi-cyclops",
  "cape-aspro",
  "treis-elies",
  "gnafkio",
  "kionia-profitis-elias",
  "psilo-dentro-pouziaris",
  // Slice 17 (batch 26) — next 17 by content richness
  "mesa-potamos",
  "stavrovouni-trail",
  "argakas-dam",
  "karvounarka",
  "moutti-anemwn",
  "agia-tilliria",
  "kastrovounos",
  "lazanias-fikardou",
  "kalevounari",
  "germasogeia-weir",
  "kalopanagiotis-oikos",
  "dymes-pelendri",
  "fikardou-archontides",
  "selladi-trypilos",
  "polystypos-hazelnut",
  "archangelos-mylos-rodous",
  "agros-kato-mylos",
]);

export const LOCALIZED_TRAIL_FIELDS = [
  "winterNotes",
  "winterSafety",
  "localSecret",
] as const;

export type LocalizedTrailField = (typeof LOCALIZED_TRAIL_FIELDS)[number];

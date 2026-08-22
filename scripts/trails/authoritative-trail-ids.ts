/**
 * Authoritative Cyprus nature-trail ids (deduped union).
 *
 * Tiers (trail-images branch, Aug 2026):
 * - Visit Cyprus state-forest / NFP pages (31)
 * - Forestry fd56 outside state forests (31)
 * - Forestry PDF leaflets not on fd56 HTML (6 additional)
 *
 * Total: 68 unique ids. Regenerate after trail-intake merges via:
 *   npm run trails:state-forest-gap  (on cursor/trail-images-visitcyprus-043e)
 */
export const AUTHORITATIVE_TRAIL_ID_COUNT = 68 as const;

/** Sorted deduped union — do not hand-edit; sync from state-forest-catalog when intake lands. */
export const AUTHORITATIVE_TRAIL_IDS = [
  "adonis",
  "agia-irini",
  "agiasma",
  "agioi-anargyroi-circular",
  "agros-kato-mylos",
  "aphrodite",
  "aphrodite-cape-greco",
  "archangelos-mylos-rodous",
  "argakas-dam",
  "ariadni",
  "arnies",
  "arsos",
  "artemis",
  "atalante",
  "avakas-gorge",
  "caledonia-falls",
  "choirokoitia-trail",
  "chorteri",
  "chrysovrysi",
  "dymes-pelendri",
  "ezousa-valley",
  "fikardou-archontides",
  "germasogeia-kyparissia",
  "germasogeia-weir",
  "gourri",
  "kalevounari",
  "kalopanagiotis-oikos",
  "kampos-tou-livadiou",
  "kannoures-agios-nikolaos",
  "kastrovounos",
  "kavos-trail",
  "kionia-profitis-elias",
  "konnoi-cyclops",
  "lagoudera-agros",
  "lagoudera-madari",
  "lazanias-fikardou",
  "lefkara-metamorfoseos",
  "lefkara-path",
  "lemithou",
  "livadi-trail",
  "loumata-ton-aeton",
  "machairas-lazanias",
  "madari-ridge",
  "millomeris-falls",
  "mnimata-piskopon",
  "moni-fylagra",
  "panagia-agapis-vavla",
  "panagia-agioi-saranda",
  "panagia-agios-ioannis",
  "panagia-araka-stavros",
  "pano-ambelia",
  "persephone",
  "petros-vanezis",
  "pissouromoutti",
  "polystypos-hazelnut",
  "prodromos-dam-stavroulia",
  "prodromos-zoumi",
  "profitis-ilias-konnoi",
  "psilo-dentro-pouziaris",
  "sea-caves-anargyroi",
  "smigies",
  "symvoulas",
  "treis-elies",
  "trooditissa-phini",
  "troodos-visitor-centre",
  "venetian-bridges",
  "vouni-panagias",
  "xyliatos-dam",
] as const satisfies readonly string[];

export type AuthoritativeTrailId = (typeof AUTHORITATIVE_TRAIL_IDS)[number];

/** Forestry mega map PDF — deferred (image-heavy ~158 MB). */
export const FORESTRY_MEGA_MAP_PDF_URL =
  "https://www.moa.gov.cy/moa/fd/fd.nsf/All/4269544DF440E9D4C22583C10026422E?OpenDocument" as const;

/** Historical i4WALKer guidebook route count (subset of Visit Cyprus 31). */
export const MEGA_MAP_HISTORICAL_ROUTE_COUNT = 26 as const;

/**
 * Alternate spellings and locale-friendly search terms (P1-04).
 * Keys are normalized tokens; values expand what we match against.
 */
export const SEARCH_ALIAS_EXPANSIONS: Record<string, string[]> = {
  limassol: ["lemesos", "λεμεσός", "lemessos"],
  lemesos: ["limassol"],
  paphos: ["pafos", "πάφος", "baf"],
  pafos: ["paphos"],
  nicosia: ["lefkosia", "λευκωσία", "lefkosa"],
  lefkara: ["λευκάρα"],
  omodos: ["όμωδος"],
  troodos: ["τρόοδος", "troodos mountains"],
  larnaca: ["larnaka", "λάρνακα"],
  ayia: ["agia", "αγία"],
  napa: ["napa", "αγία νάπα"],
  platres: ["πλάτρες"],
  kourion: ["curium"],
  kition: ["kition", "kiti", "larnaca archaeology"],
  kykkos: ["κύκκος"],
  aliki: ["salt lake", "flamingo", "hala sultan"],
  // Cross-language category terms (BUG-audit AUD-13: /de/search?q=wein → 0
  // results). Keys are the normalized form — lowercase, accents stripped —
  // because expandSearchToken normalizes before lookup. Values map onto the
  // English terms the index actually contains.
  // de
  wein: ["wine", "winery"],
  weingut: ["winery", "wine"],
  wandern: ["trail", "hike", "hiking"],
  wanderweg: ["trail", "hike"],
  strand: ["beach"],
  dorf: ["village"],
  wasserfall: ["waterfall"],
  kloster: ["monastery"],
  // pl (plaża → plaza after normalization)
  wino: ["wine", "winery"],
  winiarnia: ["winery", "wine"],
  szlak: ["trail", "hike"],
  plaza: ["beach"],
  wioska: ["village"],
  wodospad: ["waterfall"],
  klasztor: ["monastery"],
  // el (tonos stripped: κρασί → κρασι)
  "κρασι": ["wine", "winery"],
  "οινοποιειο": ["winery", "wine"],
  "μονοπατι": ["trail", "hike"],
  "παραλια": ["beach"],
  "χωριο": ["village"],
  "μοναστηρι": ["monastery"],
  // he
  "יין": ["wine", "winery"],
  "יקב": ["winery", "wine"],
  "שביל": ["trail", "hike"],
  "חוף": ["beach"],
  "כפר": ["village"],
  // ro (cramă → crama, plajă → plaja)
  vin: ["wine", "winery"],
  crama: ["winery", "wine"],
  traseu: ["trail", "hike"],
  plaja: ["beach"],
  sat: ["village"],
  // fr
  vignoble: ["winery", "wine"],
  domaine: ["winery"],
  randonnee: ["trail", "hike"],
  sentier: ["trail"],
  plage: ["beach"],
};

/** Tokens to try when scoring a query token (includes canonical + aliases). */
export function expandSearchToken(token: string): string[] {
  const t = token
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (t.length < 2) return [t];
  const aliases = SEARCH_ALIAS_EXPANSIONS[t] ?? [];
  return [t, ...aliases.map((a) =>
    a
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  )];
}

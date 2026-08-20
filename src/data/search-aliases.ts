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

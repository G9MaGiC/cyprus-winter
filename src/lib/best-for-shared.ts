/**
 * AUD-99 residual: the `bestFor` audience/context tags are curated EN tokens
 * that double as matching keys (search index, personalization, concierge
 * ranking, AI context) — those consumers keep the EN values. Display surfaces
 * localize per-token via `data.bestFor.{slug}` catalog keys; this module holds
 * the client-safe pure pieces so the guard test and any client surface can use
 * them without pulling in next-intl/server.
 */

/** Catalog key for a bestFor token ("Wine + village combo" → "wine-village-combo"). */
export function slugifyBestFor(token: string): string {
  return token
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Joins (already localized) bestFor labels for the whyNow sentence.
 * EN keeps the legacy output byte-for-byte (lowercased, " and " joiner);
 * other locales keep the labels' own casing — lowercasing would break German
 * nouns and Greek toponyms.
 *
 * Hebrew: "ו" fuses directly onto a Hebrew word, but a label kept in Latin
 * (e.g. the proper name "The Farmyard") takes the hyphenated "ו-" form and an
 * LTR isolate (U+2066/U+2069) so the RTL→LTR boundary doesn't garble visual
 * order (the AUD-96 class). The he sentence frame also fuses "ל" onto the
 * first label, so a Latin-initial first label gets a leading maqaf, making
 * the frame read "ל־" before it.
 */
export function formatBestForSentence(labels: string[], locale: string): string {
  if (locale === "en") return labels.join(" and ").toLowerCase();
  if (locale === "he") return formatHebrewSentence(labels);
  if (labels.length <= 1) return labels.join("");
  return new Intl.ListFormat(locale, { type: "conjunction" }).format(labels);
}

function formatHebrewSentence(labels: string[]): string {
  const hebrewInitial = (label: string) => /^[֐-׿]/.test(label);
  const wrap = (label: string) => (hebrewInitial(label) ? label : `⁦${label}⁩`);
  const last = labels[labels.length - 1];
  const joined =
    labels.length <= 1
      ? labels.map(wrap).join("")
      : [
          labels.slice(0, -1).map(wrap).join(", "),
          hebrewInitial(last) ? `ו${last}` : `ו-${wrap(last)}`,
        ].join(" ");
  return labels.length > 0 && !hebrewInitial(labels[0]) ? `־${joined}` : joined;
}

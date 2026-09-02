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
 * nouns and Greek toponyms. Hebrew joins with a fused "ו" prefix (ICU's list
 * format inserts "ו-", which is wrong before a Hebrew word).
 */
export function formatBestForSentence(labels: string[], locale: string): string {
  if (locale === "en") return labels.join(" and ").toLowerCase();
  if (labels.length <= 1) return labels.join("");
  if (locale === "he") {
    return `${labels.slice(0, -1).join(", ")} ו${labels[labels.length - 1]}`;
  }
  return new Intl.ListFormat(locale, { type: "conjunction" }).format(labels);
}

/**
 * Word-boundary truncation for JSON-LD descriptions — a hard slice cuts
 * mid-word with no ellipsis (AUD-120). The meta builders already do this
 * inline; schema builders share it here.
 */
export function truncateForSchema(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

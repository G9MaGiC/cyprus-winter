/**
 * Input sanitization for user-generated content (XSS prevention).
 * Use after Zod validation; strips HTML/script and normalizes whitespace.
 * Server-only or shared: safe to use in API routes and server actions.
 */

/** Decode HTML numeric/hex entities (e.g. &#106; &#x6a;) to prevent protocol bypass. */
function decodeHtmlEntities(str: string): string {
  return str.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10))).replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

/** Strip dangerous protocols from markdown links [text](url). Replaces with plain link text. Handles entity-encoded URLs. */
export function sanitizeMarkdownLinks(input: string): string {
  if (typeof input !== "string") return "";
  // URL in [text](url) may contain ) e.g. javascript:alert(1)); capture trailing )+ so we replace the whole link
  return input.replace(/\[([^\]]*)\]\(([^)]*)(\)+)/g, (fullMatch, text: string, url: string) => {
    const decoded = decodeHtmlEntities(url.trim());
    if (DANGEROUS_PROTOCOLS.test(decoded)) return text;
    return fullMatch;
  });
}

/** Strip HTML tags and normalize whitespace. Safe for display in text nodes. */
export function sanitizeText(input: string, maxLength?: number): string {
  if (typeof input !== "string") return "";
  // Remove any tag-like content (angle brackets and between)
  let out = input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  out = sanitizeMarkdownLinks(out);
  if (maxLength != null && out.length > maxLength) {
    out = out.slice(0, maxLength);
  }
  return out;
}

/** Sanitize an incremental stream fragment without trimming cross-chunk spaces. */
export function sanitizeStreamDelta(input: string): string {
  if (typeof input !== "string") return "";
  const out = input.replace(/<[^>]*>/g, "");
  return sanitizeMarkdownLinks(out);
}

/** Sanitize for storage/API: same as sanitizeText, no length limit applied here (Zod handles max). */
export function sanitizeForStorage(input: string): string {
  return sanitizeText(input);
}

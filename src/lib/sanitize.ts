/**
 * Input sanitization for user-generated content (XSS prevention).
 * Use after Zod validation; strips HTML/script and normalizes whitespace.
 * Server-only or shared: safe to use in API routes and server actions.
 */

/** Decode HTML numeric/hex entities (e.g. &#106; &#x6a;) to prevent protocol bypass. */
function decodeHtmlEntities(str: string): string {
  return str.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10))).replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

/** Strip whitespace, null bytes, and control chars that browsers ignore inside protocol schemes. */
function normalizeForProtocolCheck(str: string): string {
  return str.replace(/[\s\0\u200B\u200C\u200D\uFEFF]/g, "");
}

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

/** Strip dangerous protocols from markdown links [text](url). Replaces with plain link text. Handles entity-encoded and whitespace-obfuscated URLs. */
export function sanitizeMarkdownLinks(input: string): string {
  if (typeof input !== "string") return "";
  // Match [text](url) — allow nested parens in URL by matching balanced pairs or greedy content
  return input.replace(/\[([^\]]*)\]\(((?:[^()]*|\([^()]*\))*)\)/g, (fullMatch, text: string, url: string) => {
    const decoded = normalizeForProtocolCheck(decodeHtmlEntities(url.trim()));
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

/** Sanitize for storage/API: same as sanitizeText, no length limit applied here (Zod handles max). */
export function sanitizeForStorage(input: string): string {
  return sanitizeText(input);
}

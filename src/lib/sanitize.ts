/**
 * Input sanitization for user-generated content (XSS prevention).
 * Use after Zod validation; strips HTML/script and normalizes whitespace.
 * Server-only or shared: safe to use in API routes and server actions.
 */

/** Strip dangerous protocols from markdown links [text](url). Replaces with plain link text. */
export function sanitizeMarkdownLinks(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(
    /\[([^\]]*)\]\((javascript|data|vbscript|file):[^)]*\)/gi,
    "$1"
  );
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

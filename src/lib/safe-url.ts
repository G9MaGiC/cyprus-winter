/**
 * URL safety checks for links (XSS prevention).
 * Used when rendering markdown links from AI/user content.
 * Decodes HTML entities before protocol check to prevent bypass (e.g. &#106;avascript:).
 */

const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

/**
 * Returns true if the URL is safe to use as href (relative paths or https/http).
 * Rejects javascript:, data:, and other dangerous protocols (after decoding entities).
 */
export function isSafeUrl(url: string): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const decoded = decodeHtmlEntities(url.trim());
  const trimmed = decoded.trim().toLowerCase();
  // Protocol-relative URLs (//evil.com) must not be treated as app paths.
  if (trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/")) return true; // relative path
  if (trimmed.startsWith("#")) return true; // hash link
  for (const proto of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(proto)) return false;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return true;
  return false;
}

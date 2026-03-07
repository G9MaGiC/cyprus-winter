/**
 * URL safety checks for links (XSS prevention).
 * Used when rendering markdown links from AI/user content.
 */

const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

/**
 * Returns true if the URL is safe to use as href (relative paths or https/http).
 * Rejects javascript:, data:, and other dangerous protocols.
 */
export function isSafeUrl(url: string): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("/")) return true; // relative path
  if (trimmed.startsWith("#")) return true; // hash link
  for (const proto of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(proto)) return false;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return true;
  return false;
}

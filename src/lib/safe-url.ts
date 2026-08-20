/**
 * URL safety checks for links (XSS/open-navigation prevention).
 * Used when rendering markdown links from AI/user content.
 * Decodes HTML and percent entities before protocol/path checks.
 */

import { isSafeInternalPath } from "@/lib/safe-internal-path";

const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];
const INTERNAL_BASE = "https://cyprus-winter.invalid/";

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

function decodePercentEncoding(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Returns true if the URL is safe to use as href.
 * Internal paths are checked with a URL parser so slash/backslash variants
 * cannot be normalized into an external host by the browser.
 */
export function isSafeUrl(url: string): boolean {
  if (typeof url !== "string" || !url.trim()) return false;

  const htmlDecoded = decodeHtmlEntities(url);
  if (/[\u0000-\u001f\u007f]/.test(htmlDecoded)) return false;
  const decoded = decodePercentEncoding(htmlDecoded.trim());
  if (/[\\\u0000-\u001f\u007f]/.test(decoded)) return false;

  const trimmed = decoded.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("//")) return false;
  for (const proto of DANGEROUS_PROTOCOLS) {
    if (lower.startsWith(proto)) return false;
  }

  if (trimmed.startsWith("#")) return true;

  try {
    const parsed = new URL(trimmed, INTERNAL_BASE);
    if (trimmed.startsWith("/")) {
      return parsed.origin === new URL(INTERNAL_BASE).origin;
    }
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Markdown/chat href gate: external http(s) via `isSafeUrl`, same-origin paths
 * must also pass the AI/app allowlist (`isSafeInternalPath`) so /admin, /partner,
 * /login, /api, etc. never become clickable AppLinks.
 */
export function isSafeMarkdownHref(url: string): boolean {
  if (!isSafeUrl(url)) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("#")) return true;
  if (trimmed.startsWith("/")) return isSafeInternalPath(trimmed);
  return true;
}

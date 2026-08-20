import { existsSync } from "node:fs";
import { join } from "node:path";

/** Server-only: overlay heroes must already exist under public/images/cyprus. */
export function isSafePartnerImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed.startsWith("/images/cyprus/")) return false;
  if (trimmed.includes("..") || trimmed.includes("\\")) return false;
  if (!/\.(jpg|jpeg|png|webp)$/i.test(trimmed)) return false;
  return existsSync(join(process.cwd(), "public", trimmed));
}

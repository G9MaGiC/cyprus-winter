/**
 * Photography trust helpers — venue-accurate heroes on book/editorial surfaces.
 * Partner intake: docs/WINERY_IMAGE_INTAKE.md · docs/PHOTOGRAPHY_GUIDELINES.md
 */
import {
  classifyWineryImageSource,
  type WineryImageSource,
} from "@/lib/cyprus-images";

/** Generic stock used only when route and per-id maps miss. */
export const GENERIC_WINERY_FALLBACK = "/images/cyprus/cyprus-winery-troodos.jpg";

/** Ktima Gerolemo Omodos tasting room — only valid for Omodos-area venues. */
export const OMODOS_TASTING_IMAGE = "/images/cyprus/cyprus-winery-omodos-tasting.jpg";

const TRUSTED_WINERY_SOURCES: WineryImageSource[] = ["per-id", "partner-overlay"];

/** Book/home featured surfaces prefer dedicated or partner assets over route stock. */
export function isTrustedWineryHero(id: string): boolean {
  return TRUSTED_WINERY_SOURCES.includes(classifyWineryImageSource(id));
}

/** Wineries allowed to use the Omodos tasting-room photo. */
export const OMODOS_TASTING_WINERY_IDS = ["oenou-yi"] as const;

export function isAllowedOmodosTastingImage(wineryId: string, imageUrl: string): boolean {
  if (imageUrl !== OMODOS_TASTING_IMAGE) return true;
  return (OMODOS_TASTING_WINERY_IDS as readonly string[]).includes(wineryId);
}

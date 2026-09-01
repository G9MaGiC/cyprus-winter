import { partnerOpeningHours } from "./partner-overlay";

export { isCallAheadHours } from "./call-ahead";

export function placeCardHours(place: {
  id?: string;
  openingHours?: string;
  tastingInfo?: string;
  type?: string;
  description?: string;
}): string | undefined {
  const overlayHours = place.id ? partnerOpeningHours(place.id) : undefined;
  if (overlayHours) return overlayHours;
  const hours = place.openingHours?.trim();
  if (hours) return hours;
  if (place.type === "winery") {
    const tasting = place.tastingInfo?.trim();
    if (tasting) return tasting;
  }
  return undefined;
}

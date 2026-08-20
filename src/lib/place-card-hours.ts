const CALL_AHEAD_RE =
  /call ahead|by appointment|appointment recommended|reservations required/i;

export function isCallAheadHours(text: string | undefined): boolean {
  if (!text) return false;
  return CALL_AHEAD_RE.test(text);
}

export function placeCardHours(place: {
  openingHours?: string;
  tastingInfo?: string;
  type?: string;
  description?: string;
}): string | undefined {
  const hours = place.openingHours?.trim();
  if (hours) return hours;
  if (place.type === "winery") {
    const tasting = place.tastingInfo?.trim();
    if (tasting) return tasting;
  }
  return undefined;
}

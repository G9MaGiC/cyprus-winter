/**
 * Time-of-day bucketing for Right Now feed.
 * Uses Europe/Nicosia timezone.
 */

export type TimeBucket = "morning" | "afternoon" | "sunset" | "night";

/** Morning 5–11, afternoon 11–16, sunset 16–19, night 19–5 */
export function getTimeBucket(): TimeBucket {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Nicosia",
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()), 10);
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 19) return "sunset";
  return "night";
}

/** Parse text (bestTimeToVisit, openingHours, winterTip) for time-of-day signals */
export function getPlaceTimeSignals(text: string | undefined, placeType: string): TimeBucket[] {
  if (!text) {
    return getDefaultSignalsByType(placeType);
  }
  const t = text.toLowerCase();
  const signals: TimeBucket[] = [];
  if (/breakfast|morning|9am|10am|8am|early|winter morning|early morning/i.test(t)) signals.push("morning");
  if (/lunch|afternoon|midday|2pm|12|noon|12pm/i.test(t)) signals.push("afternoon");
  if (/sunset|golden|dusk|5pm|6pm|late afternoon|evening view|golden hour/i.test(t)) signals.push("sunset");
  if (/dinner|evening|night|live music|7pm|8pm|9pm|late night|early morning/i.test(t)) signals.push("night");
  if (signals.length === 0) return getDefaultSignalsByType(placeType);
  return [...new Set(signals)];
}

function getDefaultSignalsByType(placeType: string): TimeBucket[] {
  switch (placeType) {
    case "beach":
      return ["afternoon", "sunset"];
    case "winery":
      return ["afternoon"];
    case "restaurant":
      return ["afternoon", "night"];
    case "trail":
      return ["morning", "afternoon"];
    case "ancient":
    case "village":
    case "monastery":
    case "nature":
      return ["morning", "afternoon"];
    case "event":
      return ["afternoon", "night"];
    default:
      return ["morning", "afternoon"];
  }
}

/** Check if place prefers this bucket (from bestTimeToVisit, openingHours, winterTip, type) */
export function matchesTimeBucket(
  preferredBuckets: TimeBucket[],
  currentBucket: TimeBucket
): boolean {
  return preferredBuckets.includes(currentBucket);
}

/** Adjacent bucket (e.g. afternoon is adjacent to morning and sunset; night to morning for late night/early morning) */
const ADJACENT: Record<TimeBucket, TimeBucket[]> = {
  morning: ["afternoon", "night"],
  afternoon: ["morning", "sunset"],
  sunset: ["afternoon", "night"],
  night: ["sunset", "morning"],
};

export function isAdjacentBucket(bucket: TimeBucket, current: TimeBucket): boolean {
  return ADJACENT[current]?.includes(bucket) ?? false;
}

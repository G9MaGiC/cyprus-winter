/**
 * Admin stats time windows: UTC day boundaries so ranges align with
 * `timestamptz` / ISO comparisons regardless of server timezone.
 */

export type StatsWindow = "mtd" | "7d" | "30d";

export function parseStatsWindow(input: string | null): StatsWindow {
  return input === "7d" || input === "30d" ? input : "mtd";
}

/** Start of UTC calendar day for `date`. */
function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  );
}

/**
 * Inclusive range start (UTC midnight) for the stats window. End is always `now` (caller passes current instant).
 */
export function getStatsRangeStartUtc(window: StatsWindow, now: Date): Date {
  const y = now.getUTCFullYear();
  const mo = now.getUTCMonth();

  if (window === "mtd") {
    return new Date(Date.UTC(y, mo, 1, 0, 0, 0, 0));
  }

  const todayStart = startOfUtcDay(now);
  if (window === "7d") {
    const d = new Date(todayStart);
    d.setUTCDate(d.getUTCDate() - 7);
    return d;
  }
  if (window === "30d") {
    const d = new Date(todayStart);
    d.setUTCDate(d.getUTCDate() - 30);
    return d;
  }
  return new Date(Date.UTC(y, mo, 1, 0, 0, 0, 0));
}

export function getStatsWindowLabel(window: StatsWindow): string {
  if (window === "7d") return "last 7 days";
  if (window === "30d") return "last 30 days";
  return "month to date";
}

export function getPreviousStatsRange(
  currentStart: Date,
  currentEnd: Date
): { start: Date; end: Date } {
  const durationMs = currentEnd.getTime() - currentStart.getTime();
  const prevEnd = new Date(currentStart);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return { start: prevStart, end: prevEnd };
}

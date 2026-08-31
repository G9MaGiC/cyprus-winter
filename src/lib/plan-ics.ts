/**
 * Minimal ICS export for plan days (P2-06).
 */
import type { PlanItem } from "@/data";
import { MAX_DAYS } from "@/lib/itinerary-share";

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

export function buildPlanIcs(
  days: Record<number, string[]>,
  getPlace: (id: string) => PlanItem | undefined,
  options?: { tripStart?: Date }
): string {
  const start = options?.tripStart ?? new Date();
  const uidHost = "cyprus-winter.app";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cyprus Winter//Plan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  let eventIndex = 0;
  for (let dayNum = 1; dayNum <= MAX_DAYS; dayNum++) {
    const ids = days[dayNum] ?? [];
    if (ids.length === 0) continue;

    const dayDate = new Date(start);
    dayDate.setUTCDate(dayDate.getUTCDate() + (dayNum - 1));
    const dateStr = formatIcsDate(dayDate);
    const endDate = new Date(dayDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const endDateStr = formatIcsDate(endDate);

    const names = ids
      .map((id) => getPlace(id))
      .filter(Boolean)
      .map((p) => `${p!.name} (${p!.region})`);

    const summary = `Cyprus Winter — Day ${dayNum}`;
    // Join with a real newline — escapeIcsText encodes it once; pre-escaping
    // here double-escapes and calendars display a literal "\n" (AUD E2-01).
    const description = names.length > 0 ? names.join("\n") : "Add places in the app";

    eventIndex += 1;
    lines.push(
      "BEGIN:VEVENT",
      `UID:plan-day-${dayNum}-${eventIndex}@${uidHost}`,
      `DTSTAMP:${formatIcsDate(new Date())}T120000Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${endDateStr}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadPlanIcs(ics: string, filename = "cyprus-winter-plan.ics"): void {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

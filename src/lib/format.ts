/**
 * Format date for display (e.g. bookings).
 */
function parseDateInput(dateStr: string): Date {
  // Avoid UTC drift for YYYY-MM-DD strings (JS treats them as UTC).
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map((n) => Number(n));
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
}

export function formatDate(dateStr: string, locale?: string): string {
  const d = parseDateInput(dateStr);
  if (Number.isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Days until a date (0 = today, 1 = tomorrow, negative = past).
 */
export function daysUntil(dateStr: string): number {
  const d = parseDateInput(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Group label for upcoming booking date: "today" | "this_week" | "later".
 * Used for smarter IA on bookings page.
 */
export function getUpcomingDateGroup(dateStr: string): "today" | "this_week" | "later" {
  const days = daysUntil(dateStr);
  if (days <= 0) return "today";
  if (days <= 7) return "this_week";
  return "later";
}

/**
 * Format relative time for trail reports and similar.
 */
export function formatReportedAgo(iso: string, locale?: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Invalid Date";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" });
    if (diffHours < 1) return rtf.format(0, "minute");
    if (diffHours < 24) return rtf.format(-diffHours, "hour");
    if (diffDays < 7) return rtf.format(-diffDays, "day");
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);
  } catch {
    return "Invalid Date";
  }
}

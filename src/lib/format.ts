/**
 * Format date for display (e.g. bookings).
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Days until a date (0 = today, 1 = tomorrow, negative = past).
 */
export function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
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
export function formatReportedAgo(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

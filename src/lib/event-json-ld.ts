/**
 * schema.org Event expects startDate as ISO 8601. Human-readable strings
 * ("Weekends in December") must not be emitted — invalid markup hurts SEO.
 */
export function startDateForEventJsonLd(dates?: string): string | undefined {
  if (!dates?.trim()) return undefined;
  const s = dates.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const y = Number(s.slice(0, 4));
    const m = Number(s.slice(5, 7));
    const d = Number(s.slice(8, 10));
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const t = Date.UTC(y, m - 1, d);
      if (!Number.isNaN(t)) return s;
    }
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const ms = Date.parse(s);
    if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  }

  return undefined;
}

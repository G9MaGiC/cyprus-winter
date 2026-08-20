import { routing } from "@/i18n/routing";

export type StatsKpiLocaleSource = "properties.path_or_locale";

export type StatsKpiExportInput = {
  window: string;
  windowLabel: string;
  rangeStartIso: string;
  rangeEndIso: string;
  bookingsThisMonth: number;
  partnerRevenueEur: number;
  partnerRevenueByWinery: {
    providerId: string;
    providerName: string;
    bookingCount: number;
    totalFeeEur: number;
  }[];
  funnel: { event: string; count: number }[];
  localeBreakdown: { locale: string; count: number }[];
  localeSource: StatsKpiLocaleSource;
  planGeographyBreakdown: { bucket: string; count: number }[];
  planGeographySource: "plan_add.item_id";
};

export function localeFromTrackedProperties(
  properties: Record<string, unknown>
): string {
  const loc = properties.locale;
  if (typeof loc === "string" && (routing.locales as readonly string[]).includes(loc)) {
    return loc;
  }
  const path = properties.path;
  if (typeof path === "string" && path.length > 0) {
    const segments = path.split("/").filter(Boolean);
    const first = segments[0];
    if (first && (routing.locales as readonly string[]).includes(first)) {
      return first;
    }
    if (path.startsWith("/")) return routing.defaultLocale;
  }
  return "unknown";
}

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(cells: Array<string | number>): string {
  return cells.map(csvEscape).join(",");
}

export function buildStatsKpiCsv(input: StatsKpiExportInput): string {
  const lines = [
    "section,key,value,extra,amount",
    csvRow(["meta", "window", input.window]),
    csvRow(["meta", "window_label", input.windowLabel]),
    csvRow(["meta", "range_start", input.rangeStartIso]),
    csvRow(["meta", "range_end", input.rangeEndIso]),
    csvRow(["locale_source", input.localeSource]),
    csvRow(["plan_geography_source", input.planGeographySource]),
    csvRow(["bookings", "total", input.bookingsThisMonth]),
    csvRow(["partner_revenue_eur", "total", input.partnerRevenueEur]),
  ];
  for (const row of input.funnel) {
    lines.push(csvRow(["funnel", row.event, row.count]));
  }
  for (const partner of input.partnerRevenueByWinery) {
    lines.push(
      csvRow([
        "partner",
        partner.providerId,
        partner.providerName,
        partner.bookingCount,
        partner.totalFeeEur,
      ])
    );
  }
  for (const row of input.localeBreakdown) {
    lines.push(csvRow(["locale", row.locale, row.count]));
  }
  for (const row of input.planGeographyBreakdown) {
    lines.push(csvRow(["plan_geography", row.bucket, row.count]));
  }
  return `${lines.join("\n")}\n`;
}

export function statsKpiFilename(
  kind: "csv" | "json",
  window: string,
  now: Date
): string {
  const day = now.toISOString().slice(0, 10);
  const safeWindow = window.replace(/[^a-z0-9]/gi, "") || "mtd";
  return `cyprus-winter-kpis-${safeWindow}-${day}.${kind}`;
}

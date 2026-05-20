/**
 * Trail reports (crowd-sourced conditions). Uses Supabase when configured.
 */
import { getSupabase, hasSupabase } from "./supabase";

export type TrailReportStatus = "open" | "caution" | "closed";
export type TrailReportSurface = "dry" | "muddy" | "snow" | "icy";

export type TrailReport = {
  id: string;
  trailId: string;
  status: TrailReportStatus;
  surface: TrailReportSurface;
  note?: string;
  temperatureC?: number;
  windKmh?: number;
  reportedAt: string;
  reporterEmail?: string;
  createdAt: string;
};

function generateId(): string {
  return `tr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function createTrailReport(input: {
  trailId: string;
  status: TrailReportStatus;
  surface: TrailReportSurface;
  note?: string;
  temperatureC?: number;
  windKmh?: number;
  reporterEmail?: string;
}): Promise<{ report: TrailReport; stored: boolean }> {
  const id = generateId();
  const reportedAt = new Date().toISOString();

  const supabase = getSupabase();
  let stored = false;
  if (supabase) {
    const { error } = await supabase.from("trail_reports").insert({
      id,
      trail_id: input.trailId,
      status: input.status,
      surface: input.surface,
      note: input.note ?? null,
      temperature_c: input.temperatureC ?? null,
      wind_kmh: input.windKmh ?? null,
      reported_at: reportedAt,
      reporter_email: input.reporterEmail ?? null,
      created_at: reportedAt,
    });
    if (error) throw new Error(error.message);
    stored = true;
  }

  return {
    report: {
      id,
      trailId: input.trailId,
      status: input.status,
      surface: input.surface,
      note: input.note,
      temperatureC: input.temperatureC,
      windKmh: input.windKmh,
      reportedAt,
      reporterEmail: input.reporterEmail,
      createdAt: reportedAt,
    },
    stored,
  };
}

export async function getLatestReportsByTrail(trailId: string, limit = 5): Promise<TrailReport[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("trail_reports")
    .select("*")
    .eq("trail_id", trailId)
    .order("reported_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    trailId: String(row.trail_id),
    status: row.status as TrailReportStatus,
    surface: row.surface as TrailReportSurface,
    note: row.note ? String(row.note) : undefined,
    temperatureC: row.temperature_c != null ? Number(row.temperature_c) : undefined,
    windKmh: row.wind_kmh != null ? Number(row.wind_kmh) : undefined,
    reportedAt: String(row.reported_at),
    reporterEmail: row.reporter_email ? String(row.reporter_email) : undefined,
    createdAt: String(row.created_at),
  }));
}

export const hasTrailReports = hasSupabase;

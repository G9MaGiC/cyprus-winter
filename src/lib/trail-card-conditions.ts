import type { TrailConditions, TrailStatus, TrailSurface } from "@/data/trails";

export type TrailCardConditionSource = "report" | "editorial" | "none";

export type TrailCardConditionView = {
  source: TrailCardConditionSource;
  status?: TrailStatus;
  surface?: TrailSurface;
  lastReportedAt?: string;
  temperatureC?: number;
  tip?: string;
};

export type TrailCardReportInput = {
  trailId: string;
  status: TrailStatus;
  surface: TrailSurface;
  reportedAt: string;
  temperatureC?: number;
  note?: string;
};

/** Hiker reports win over static winter snapshots; otherwise show editorial or none. */
export function resolveTrailCardConditions(
  editorial?: TrailConditions,
  report?: TrailCardReportInput
): TrailCardConditionView {
  if (report) {
    return {
      source: "report",
      status: report.status,
      surface: report.surface,
      lastReportedAt: report.reportedAt,
      temperatureC: report.temperatureC,
      tip: report.note,
    };
  }
  if (editorial) {
    return {
      source: "editorial",
      status: editorial.status,
      surface: editorial.surface,
      lastReportedAt: editorial.lastReportedAt,
      temperatureC: editorial.temperatureC,
      tip: editorial.tip,
    };
  }
  return { source: "none" };
}

export function trailConditionsFromView(
  trailId: string,
  view: TrailCardConditionView
): TrailConditions | undefined {
  if (view.source === "none" || !view.status || !view.surface) return undefined;
  return {
    trailId,
    status: view.status,
    surface: view.surface,
    lastReportedAt: view.lastReportedAt,
    temperatureC: view.temperatureC,
    tip: view.tip,
  };
}

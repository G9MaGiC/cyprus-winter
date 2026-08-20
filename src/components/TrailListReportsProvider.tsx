"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TrailCardReportInput } from "@/lib/trail-card-conditions";

const TrailListReportsContext = createContext<Record<string, TrailCardReportInput>>({});

export function TrailListReportsProvider({
  reports,
  children,
}: {
  reports: Record<string, TrailCardReportInput>;
  children: ReactNode;
}) {
  return (
    <TrailListReportsContext.Provider value={reports}>{children}</TrailListReportsContext.Provider>
  );
}

export function useTrailListReports(): Record<string, TrailCardReportInput> {
  return useContext(TrailListReportsContext);
}

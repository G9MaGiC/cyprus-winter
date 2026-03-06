import type { Metadata } from "next";
import { trails } from "@/data/trails";
import TrailReportClient from "./TrailReportClient";

export const metadata: Metadata = {
  title: "Report trail conditions | Cyprus Winter",
  description: "Submit a quick update on trail conditions to help other hikers.",
  robots: { index: false, follow: true },
};

export function generateStaticParams() {
  return trails.map((t) => ({ id: t.id }));
}

export default function TrailReportPage() {
  return <TrailReportClient />;
}

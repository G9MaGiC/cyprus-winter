import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { trails } from "@/data/trails";
import TrailReportClient from "./TrailReportClient";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const trail = trails.find((t) => t.id === id || t.slug === id);
  if (!trail) notFound();
  const locale = await getLocale();
  return buildTranslatedHubMetadata("trailReport", locale, `/trails/${id}/report`);
}

export function generateStaticParams() {
  return trails.map((t) => ({ id: t.id }));
}

export default function TrailReportPage() {
  return <TrailReportClient />;
}

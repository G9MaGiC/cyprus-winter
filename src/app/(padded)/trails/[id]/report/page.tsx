import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { trailReportPageMeta } from "@/lib/locale-page-meta";
import { trails } from "@/data/trails";
import TrailReportClient from "./TrailReportClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return applyLocaleToMetadata(
    trailReportPageMeta,
    `/trails/${id}/report`,
    routing.defaultLocale
  );
}

export function generateStaticParams() {
  return trails.map((t) => ({ id: t.id }));
}

export default function TrailReportPage() {
  return <TrailReportClient />;
}

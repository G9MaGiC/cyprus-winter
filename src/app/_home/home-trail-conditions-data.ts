import "server-only";

import { trailConditions, TRAIL_CONDITIONS_AS_OF } from "@/data/trails";
import { formatMonthYear } from "@/lib/format";
import { getLocale, getTranslations } from "next-intl/server";
import type { HomeTrailConditionsStripViewProps } from "@/app/_home/HomeTrailConditionsStripView";

const TROODOS_TRAILS = ["artemis", "atalante", "caledonia-falls", "olympus-summit", "persephone"] as const;

function getStatusCounts() {
  const withStatus = TROODOS_TRAILS.flatMap((id) => {
    const cond = trailConditions[id];
    if (!cond) return [];
    return [{ id, status: cond.status }];
  });
  return {
    open: withStatus.filter((x) => x.status === "open").length,
    caution: withStatus.filter((x) => x.status === "caution").length,
    closed: withStatus.filter((x) => x.status === "closed").length,
  };
}

export async function getHomeTrailConditionsStripProps(
  locale?: string
): Promise<HomeTrailConditionsStripViewProps> {
  const t = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");
  const { open, caution, closed } = getStatusCounts();

  let summaryLabel: string;
  if (open > 0 && closed === 0 && caution === 0) {
    summaryLabel = t("trailConditionsStrip.goodToGo");
  } else if (caution > 0 && closed === 0) {
    summaryLabel = t("trailConditionsStrip.cautionOnly", { count: caution });
  } else if (closed > 0) {
    summaryLabel = t("trailConditionsStrip.withClosed", { count: closed });
  } else {
    summaryLabel = t("trailConditionsStrip.checkConditions");
  }

  const resolvedLocale = locale ?? (await getLocale());

  return {
    aria: t("trailConditionsStrip.aria"),
    heading: t("trailConditionsStrip.heading"),
    // The counts summarize the editorial snapshot — date them (AUD-12).
    asOfLabel: t("trailConditionsStrip.asOf", {
      date: formatMonthYear(TRAIL_CONDITIONS_AS_OF, resolvedLocale),
    }),
    openLabel: open > 0 ? t("trailConditionsStrip.open", { count: open }) : null,
    cautionLabel: caution > 0 ? t("trailConditionsStrip.caution", { count: caution }) : null,
    closedLabel: closed > 0 ? t("trailConditionsStrip.closed", { count: closed }) : null,
    noReportLabel:
      open === 0 && caution === 0 && closed === 0
        ? t("trailConditionsStrip.checkReports")
        : null,
    summaryLabel,
  };
}

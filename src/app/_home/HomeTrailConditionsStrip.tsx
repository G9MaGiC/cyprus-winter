import type { ComponentType } from "react";
import { trailConditions } from "@/data/trails";
import { LAYOUT, STRIP, TYPE } from "@/lib/design-tokens";
import type { LinkProps } from "@/app/_home/types";
import { getTranslations } from "next-intl/server";

const TROODOS_TRAILS = ["artemis", "atalante", "caledonia-falls", "olympus-summit", "persephone"] as const;

function getStatusCounts() {
  const withStatus = TROODOS_TRAILS.flatMap((id) => {
    const cond = trailConditions[id];
    if (!cond) return [];
    return [{ id, status: cond.status }];
  });
  const open = withStatus.filter((x) => x.status === "open").length;
  const caution = withStatus.filter((x) => x.status === "caution").length;
  const closed = withStatus.filter((x) => x.status === "closed").length;
  return { open, caution, closed, total: TROODOS_TRAILS.length };
}

export default async function HomeTrailConditionsStrip({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const t = await getTranslations("home");
  const Link = LinkComponent;
  const { open, caution, closed } = getStatusCounts();
  let label: string;
  if (open > 0 && closed === 0 && caution === 0) label = t("trailConditionsStrip.goodToGo");
  else if (caution > 0 && closed === 0) label = t("trailConditionsStrip.cautionOnly", { count: caution });
  else if (closed > 0) label = t("trailConditionsStrip.withClosed", { count: closed });
  else label = t("trailConditionsStrip.checkConditions");

  return (
    <section
      aria-labelledby="trail-conditions-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-aegean/5 border-b border-sand-200/70`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <Link
          href="/trails"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-h-[44px] py-2 group"
          aria-label={t("trailConditionsStrip.aria")}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span id="trail-conditions-heading" className={`${TYPE.cardTitle} tracking-[-0.01em]`}>
              {t("trailConditionsStrip.heading")}
            </span>
            <span className="flex items-center gap-3 text-sm text-olive/80">
              {open > 0 && <span className="flex items-center gap-1.5 text-sage font-medium"><span className="w-1.5 h-1.5 rounded-full bg-sage inline-block shrink-0" aria-hidden />{t("trailConditionsStrip.open", { count: open })}</span>}
              {caution > 0 && <span className="flex items-center gap-1.5 text-golden font-medium"><span className="w-1.5 h-1.5 rounded-full bg-golden inline-block shrink-0" aria-hidden />{t("trailConditionsStrip.caution", { count: caution })}</span>}
              {closed > 0 && <span className="flex items-center gap-1.5 text-terracotta font-medium"><span className="w-1.5 h-1.5 rounded-full bg-terracotta inline-block shrink-0" aria-hidden />{t("trailConditionsStrip.closed", { count: closed })}</span>}
              {open === 0 && caution === 0 && closed === 0 && (
                <span className="text-olive/60">{t("trailConditionsStrip.checkReports")}</span>
              )}
            </span>
          </div>
          <span className="text-sage text-sm group-hover:text-terracotta transition-colors shrink-0">
            {label}
          </span>
        </Link>
      </div>
    </section>
  );
}

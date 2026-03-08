import { Link } from "@/i18n/navigation";
import { trailConditions } from "@/data/trails";
import { LAYOUT, STRIP } from "@/lib/design-tokens";

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

function getGoNoGoLabel() {
  const { open, caution, closed } = getStatusCounts();
  if (open > 0 && closed === 0 && caution === 0) return "Troodos trails good to go";
  if (caution > 0 && closed === 0) return `${caution} trail${caution > 1 ? "s" : ""} need${caution === 1 ? "s" : ""} caution`;
  if (closed > 0) return `${closed} trail${closed > 1 ? "s" : ""} closed — check before you go`;
  return "Check trail conditions before Troodos";
}

export default function HomeTrailConditionsStrip() {
  const { open, caution, closed } = getStatusCounts();
  const label = getGoNoGoLabel();

  return (
    <section
      aria-labelledby="trail-conditions-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-aegean/5 border-b border-sand-200/70`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <Link
          href="/trails"
          className="flex flex-wrap items-center justify-between gap-2 min-h-[44px] py-1 group"
          aria-label="Troodos trail conditions — check status before you go"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span id="trail-conditions-heading" className="font-display font-semibold text-olive group-hover:text-terracotta transition-colors">
              Trails today
            </span>
            <span className="flex items-center gap-2 text-sm text-olive/80">
              {open > 0 && <span className="text-sage font-medium">{open} open</span>}
              {caution > 0 && <span className="text-golden font-medium">{caution} caution</span>}
              {closed > 0 && <span className="text-terracotta font-medium">{closed} closed</span>}
              {open === 0 && caution === 0 && closed === 0 && (
                <span className="text-olive/60">Check reports</span>
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

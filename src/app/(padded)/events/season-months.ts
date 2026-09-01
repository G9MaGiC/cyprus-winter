export const MONTH_ORDER = ["Nov", "Dec", "Jan", "Feb", "Mar"] as const;

export type SeasonMonth = (typeof MONTH_ORDER)[number];

/** JS month index → winter-season month key (AUD-59). */
export const SEASON_BY_JS_MONTH: Record<number, SeasonMonth> = {
  10: "Nov",
  11: "Dec",
  0: "Jan",
  1: "Feb",
  2: "Mar",
};

/** AUD-59: in season, "now" leads — the current month first, the rest in
    season order (annual events: earlier months wrap to the end as next
    winter). Out of season (anchor null) the planning order stays Nov-first. */
export function orderedSeasonMonths(anchor: SeasonMonth | null): readonly SeasonMonth[] {
  if (!anchor) return MONTH_ORDER;
  const i = MONTH_ORDER.indexOf(anchor);
  if (i <= 0) return MONTH_ORDER;
  return [...MONTH_ORDER.slice(i), ...MONTH_ORDER.slice(0, i)];
}

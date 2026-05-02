"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import BackLink from "@/components/BackLink";
import { LAYOUT, SECTION, SKELETON } from "@/lib/design-tokens";

const ADMIN_KEY_STORAGE = "cyprus-admin-key";
const EVENT_LABELS: Record<string, string> = {
  page_view: "Page view",
  discover_view: "Discover view",
  winery_detail_view: "Winery detail view",
  shop_click: "High-intent click",
  plan_add: "Added to plan",
  booking_start: "Booking started",
  booking_complete: "Booking completed",
};
const SOURCE_LABELS: Record<string, string> = {
  discover_footer: "Discover footer CTA",
  events_hero: "Events hero CTA",
  plan_winery_bar: "Plan winery bar",
  search_result_card: "Search result card",
  dropdown_open: "Search dropdown click",
  dropdown_enter: "Search dropdown enter",
  dropdown_add: "Search dropdown add",
  add_to_itinerary_button: "Add to itinerary button",
  unknown: "Unlabeled source",
};

function labelEvent(event: string): string {
  return EVENT_LABELS[event] ?? event;
}

function labelSource(source: string): string {
  return SOURCE_LABELS[source] ?? source.replaceAll("_", " ");
}

function formatRate(numerator: number, denominator: number): string {
  if (denominator <= 0) return "n/a";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function formatDelta(current: number | null, previous: number | null, suffix = ""): string {
  if (current === null || previous === null) return "→ n/a";
  const diff = current - previous;
  const sign = diff > 0 ? "+" : "";
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
  const base = previous === 0 ? null : (diff / previous) * 100;
  const pct = base === null ? "n/a" : `${sign}${base.toFixed(1)}%`;
  return `${arrow} ${sign}${diff.toLocaleString()}${suffix} (${pct})`;
}

function toPercent(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

function localWindowLabel(window: StatsWindow): string {
  if (window === "7d") return "last 7 days";
  if (window === "30d") return "last 30 days";
  return "month to date";
}

type FunnelRow = { event: string; count: number };
type SourceRow = { source: string; count: number };
type PartnerRow = { providerId: string; providerName: string; bookingCount: number; totalFeeEur: number };
type StatsWindow = "mtd" | "7d" | "30d";

type StatsData = {
  bookingsThisMonth?: number;
  partnerRevenueEur?: number;
  partnerRevenueByWinery?: PartnerRow[];
  funnel?: FunnelRow[];
  sourceBreakdown?: Record<string, SourceRow[]>;
  window?: StatsWindow;
  windowLabel?: string;
  rangeStartIso?: string;
  rangeEndIso?: string;
  compare?: {
    bookings?: number;
    partnerRevenueEur?: number;
    funnelCounts?: Record<string, number>;
    sourceBreakdown?: Record<string, SourceRow[]>;
    rangeStartIso?: string;
    rangeEndIso?: string;
  };
  storage?: string;
  error?: string;
};

export default function AdminStatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [statsWindow, setStatsWindow] = useState<StatsWindow>("mtd");
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchStats = useCallback((token: string, statsWindow: StatsWindow) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setKeyError(null);
    const headers: HeadersInit = {};
    if (token !== "session") {
      headers.Authorization = `Bearer ${token}`;
    }
    fetch(`/api/stats?window=${statsWindow}`, {
      credentials: "include",
      headers,
    })
      .then((r) => {
        if (requestId !== requestIdRef.current) return null;
        if (r.status === 401) {
          sessionStorage.removeItem(ADMIN_KEY_STORAGE);
          void fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
          setAdminKey(null);
          setKeyError("Invalid key");
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (requestId !== requestIdRef.current) return;
        if (json && !json.error) setData(json);
        else if (json?.error && json.error !== "Invalid key") setData({ error: json.error });
      })
      .catch((e) => {
        if (requestId !== requestIdRef.current) return;
        setData({ error: String(e) });
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, []);

  // Prefer HttpOnly admin cookie; fall back to legacy sessionStorage bearer.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { credentials: "include" })
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          setAdminKey("session");
        } else {
          const stored = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_KEY_STORAGE) : null;
          if (stored) setAdminKey(stored);
          else setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!adminKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch updates UI state from API response
    fetchStats(adminKey, statsWindow);
  }, [adminKey, statsWindow, fetchStats]);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    setKeyError(null);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: key }),
    });
    if (!res.ok) {
      setKeyError("Invalid key");
      return;
    }
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setKeyInput("");
    setAdminKey("session");
  };

  if (!adminKey) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <h1 className={`font-display text-2xl font-bold text-olive ${SECTION.headingGap}`}>Admin stats</h1>
        <p className="text-sm text-olive/70 mb-6">
          Enter your admin key to view traction metrics. Set ADMIN_SECRET in your environment.
        </p>
        <form onSubmit={handleKeySubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); setKeyError(null); }}
            placeholder="Admin key"
            autoComplete="current-password"
            aria-label="Admin key"
            className="flex-1 min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-2 text-sm text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30"
          />
          <button
            type="submit"
            disabled={!keyInput.trim()}
            className="min-h-[44px] px-5 py-2 rounded-lg bg-terracotta text-white font-semibold hover:bg-terracotta-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Access
          </button>
        </form>
        {keyError && <p className="text-sm text-terracotta mt-2">{keyError}</p>}
        <div className="mt-8">
          <BackLink href="/" label="Back to home" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-display text-2xl font-bold text-olive">Admin stats</h1>
          <BackLink href="/" label="Back to home" />
        </div>
        <div className="space-y-6">
          <div className={`h-8 w-48 ${SKELETON.bar}`} aria-hidden />
          <div className={`h-24 ${SKELETON.block}`} aria-hidden />
          <div className={`h-32 ${SKELETON.block}`} aria-hidden />
        </div>
        <p className="sr-only" role="status" aria-live="polite">Loading…</p>
      </div>
    );
  }

  const err = (data as StatsData)?.error;
  if (err) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <p className="text-terracotta">Failed to load stats: {err}</p>
      </div>
    );
  }

  const d = data as StatsData;
  const windowLabel = d.windowLabel ?? localWindowLabel(statsWindow);
  const bookings = d.bookingsThisMonth ?? 0;
  const revenue = d.partnerRevenueEur ?? 0;
  const byWinery = d.partnerRevenueByWinery ?? [];
  const funnel = d.funnel ?? [];
  const sourceBreakdown = d.sourceBreakdown ?? {};
  const shopClickSources = sourceBreakdown.shop_click ?? [];
  const planAddSources = sourceBreakdown.plan_add ?? [];
  const funnelMap = new Map(funnel.map((row) => [row.event, row.count]));
  const pageViews = funnelMap.get("page_view") ?? 0;
  const discoverViews = funnelMap.get("discover_view") ?? 0;
  const shopClicks = funnelMap.get("shop_click") ?? 0;
  const planAdds = funnelMap.get("plan_add") ?? 0;
  const bookingStarts = funnelMap.get("booking_start") ?? 0;
  const bookingCompletes = funnelMap.get("booking_complete") ?? 0;
  const prev = d.compare ?? {};
  const prevBookings = prev.bookings ?? 0;
  const prevRevenue = prev.partnerRevenueEur ?? 0;
  const prevFunnelMap = new Map(Object.entries(prev.funnelCounts ?? {}));
  const prevDiscoverViews = Number(prevFunnelMap.get("discover_view") ?? 0);
  const prevShopClicks = Number(prevFunnelMap.get("shop_click") ?? 0);
  const prevPlanAdds = Number(prevFunnelMap.get("plan_add") ?? 0);
  const prevBookingStarts = Number(prevFunnelMap.get("booking_start") ?? 0);
  const prevBookingCompletes = Number(prevFunnelMap.get("booking_complete") ?? 0);
  const prevPageViews = Number(prevFunnelMap.get("page_view") ?? 0);
  const currentDiscoverToClick = toPercent(shopClicks, discoverViews);
  const currentClickToPlan = toPercent(planAdds, shopClicks);
  const currentPlanToStart = toPercent(bookingStarts, planAdds);
  const currentStartToComplete = toPercent(bookingCompletes, bookingStarts);
  const currentPageToComplete = toPercent(bookingCompletes, pageViews);
  const prevDiscoverToClick = toPercent(prevShopClicks, prevDiscoverViews);
  const prevClickToPlan = toPercent(prevPlanAdds, prevShopClicks);
  const prevPlanToStart = toPercent(prevBookingStarts, prevPlanAdds);
  const prevStartToComplete = toPercent(prevBookingCompletes, prevBookingStarts);
  const prevPageToComplete = toPercent(prevBookingCompletes, prevPageViews);

  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold text-olive">Admin stats</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(ADMIN_KEY_STORAGE);
              void fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
              setAdminKey(null);
              setData(null);
            }}
            className="text-sm text-olive/60 hover:text-olive"
          >
            Sign out
          </button>
          <BackLink href="/" label="Home" />
        </div>
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Stats time window">
        {([
          { id: "mtd", label: "MTD" },
          { id: "7d", label: "7D" },
          { id: "30d", label: "30D" },
        ] as const).map((opt) => {
          const active = statsWindow === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatsWindow(opt.id)}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-terracotta text-white"
                  : "border border-sand-200/80 bg-white text-olive hover:border-terracotta/40 hover:text-terracotta"
              }`}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
        <span className="text-sm text-olive/60 ml-1">Showing {windowLabel}</span>
      </div>

      <section className="mb-10">
        <h2 className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>Bookings ({windowLabel})</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10 mb-6">
          <p className="text-3xl font-bold text-olive">{bookings}</p>
          <p className="text-sm text-olive/70 mt-1">Total bookings</p>
          <p className="text-xs text-olive/60 mt-1">vs previous period: {formatDelta(bookings, prevBookings)}</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>Partner revenue ({windowLabel})</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10">
          <p className="text-3xl font-bold text-olive">{revenue.toFixed(2)} €</p>
          <p className="text-sm text-olive/70 mt-1">Partner revenue share (lead fees)</p>
          <p className="text-xs text-olive/60 mt-1">vs previous period: {formatDelta(revenue, prevRevenue, " €")}</p>
          {byWinery.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {byWinery.map((w) => (
                <li key={w.providerId} className="flex justify-between">
                  <span className="text-olive">{w.providerName}</span>
                  <span className="text-olive/80">{w.bookingCount} × {w.totalFeeEur.toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>Conversion funnel ({windowLabel})</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10">
          <p className="text-sm text-olive/70 mb-4">First touch to booking and revenue</p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200/80">
                <th className="py-2 font-medium text-olive">Event</th>
                <th className="py-2 font-medium text-olive text-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((row) => (
                <tr key={row.event} className="border-b border-sand-100">
                  <td className="py-2 text-olive">{labelEvent(row.event)}</td>
                  <td className="py-2 text-olive/80 text-right">{row.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {funnel.length === 0 && (
            <p className="text-sm text-olive/60 py-4">No events yet. Conversion tracking requires Supabase and migration 003.</p>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>Derived metrics ({windowLabel})</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive">Discover to high-intent click</span>
              <span className="text-olive/80">{formatRate(shopClicks, discoverViews)}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive/60">vs previous period</span>
              <span className="text-olive/70">{formatDelta(currentDiscoverToClick, prevDiscoverToClick, "pp")}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive">High-intent click to added to plan</span>
              <span className="text-olive/80">{formatRate(planAdds, shopClicks)}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive/60">vs previous period</span>
              <span className="text-olive/70">{formatDelta(currentClickToPlan, prevClickToPlan, "pp")}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive">Added to plan to booking started</span>
              <span className="text-olive/80">{formatRate(bookingStarts, planAdds)}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive/60">vs previous period</span>
              <span className="text-olive/70">{formatDelta(currentPlanToStart, prevPlanToStart, "pp")}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive">Booking started to booking completed</span>
              <span className="text-olive/80">{formatRate(bookingCompletes, bookingStarts)}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive/60">vs previous period</span>
              <span className="text-olive/70">{formatDelta(currentStartToComplete, prevStartToComplete, "pp")}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive">Page view to booking completed</span>
              <span className="text-olive/80">{formatRate(bookingCompletes, pageViews)}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-olive/60">vs previous period</span>
              <span className="text-olive/70">{formatDelta(currentPageToComplete, prevPageToComplete, "pp")}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>Source breakdown ({windowLabel})</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10">
          <p className="text-sm text-olive/70 mb-4">Where click and add events come from</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-olive mb-2">shop_click</h3>
              {shopClickSources.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {shopClickSources.map((row) => (
                    <li key={`shop-${row.source}`} className="flex items-center justify-between gap-3">
                      <span className="text-olive/90 break-all">{labelSource(row.source)}</span>
                      <span className="text-olive/70">
                        {row.count.toLocaleString()} ({formatRate(row.count, shopClicks)})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-olive/60">No source data yet.</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-olive mb-2">plan_add</h3>
              {planAddSources.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {planAddSources.map((row) => (
                    <li key={`plan-${row.source}`} className="flex items-center justify-between gap-3">
                      <span className="text-olive/90 break-all">{labelSource(row.source)}</span>
                      <span className="text-olive/70">
                        {row.count.toLocaleString()} ({formatRate(row.count, planAdds)})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-olive/60">No source data yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs text-olive/50">
        Storage: {d.storage ?? "unknown"}
      </p>
    </div>
  );
}

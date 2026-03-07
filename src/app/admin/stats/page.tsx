"use client";

import { useEffect, useState, useCallback } from "react";
import BackLink from "@/components/BackLink";
import { LAYOUT } from "@/lib/design-tokens";

const ADMIN_KEY_STORAGE = "cyprus-admin-key";

type FunnelRow = { event: string; count: number };
type PartnerRow = { providerId: string; providerName: string; bookingCount: number; totalFeeEur: number };

type StatsData = {
  bookingsThisMonth?: number;
  partnerRevenueEur?: number;
  partnerRevenueByWinery?: PartnerRow[];
  funnel?: FunnelRow[];
  storage?: string;
  error?: string;
};

export default function AdminStatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState<string | null>(null);

  const fetchStats = useCallback((token: string) => {
    setLoading(true);
    setKeyError(null);
    fetch("/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) {
          sessionStorage.removeItem(ADMIN_KEY_STORAGE);
          setAdminKey(null);
          setKeyError("Invalid key");
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (json && !json.error) setData(json);
        else if (json?.error && json.error !== "Invalid key") setData({ error: json.error });
      })
      .catch((e) => setData({ error: String(e) }))
      .finally(() => setLoading(false));
  }, []);

  // Restore admin key from sessionStorage on mount and fetch stats if present.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_KEY_STORAGE) : null;
    if (stored) {
      setAdminKey(stored); // eslint-disable-line react-hooks/set-state-in-effect -- client restore
      fetchStats(stored);
    } else {
      setLoading(false);
    }
  }, [fetchStats]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    setAdminKey(key);
    setKeyInput("");
    fetchStats(key);
  };

  if (!adminKey) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <h1 className="font-display text-2xl font-bold text-olive mb-4">Admin stats</h1>
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
            className="flex-1 min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-2 text-sm text-olive focus:outline-none focus:ring-2 focus:ring-terracotta/30"
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
        <p className="text-olive/70">Loading…</p>
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
  const bookings = d.bookingsThisMonth ?? 0;
  const revenue = d.partnerRevenueEur ?? 0;
  const byWinery = d.partnerRevenueByWinery ?? [];
  const funnel = d.funnel ?? [];

  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold text-olive">Admin stats</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(ADMIN_KEY_STORAGE);
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

      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-olive mb-4">Bookings (this month)</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-sand-200/80 mb-6">
          <p className="text-3xl font-bold text-olive">{bookings}</p>
          <p className="text-sm text-olive/70 mt-1">Total bookings</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-olive mb-4">Partner revenue (this month)</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-sand-200/80">
          <p className="text-3xl font-bold text-olive">{revenue.toFixed(2)} €</p>
          <p className="text-sm text-olive/70 mt-1">Partner revenue share (lead fees)</p>
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
        <h2 className="font-display text-lg font-semibold text-olive mb-4">Conversion funnel (this month)</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-sand-200/80">
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
                  <td className="py-2 text-olive">{row.event}</td>
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

      <p className="text-xs text-olive/50">
        Storage: {d.storage ?? "unknown"}
      </p>
    </div>
  );
}

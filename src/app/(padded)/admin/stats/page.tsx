"use client";

import { useEffect, useState, useCallback } from "react";
import BackLink from "@/components/BackLink";
import { LAYOUT, SECTION, SKELETON, TYPE, CTA } from "@/lib/design-tokens";
import { statsKpiFilename } from "@/lib/stats-kpi-export";
import { useLocale, useTranslations } from "next-intl";

type FunnelRow = { event: string; count: number };
type PartnerRow = { providerId: string; providerName: string; bookingCount: number; totalFeeEur: number };
type LocaleRow = { locale: string; count: number };

type StatsData = {
  bookingsThisMonth?: number;
  partnerRevenueEur?: number;
  partnerRevenueByWinery?: PartnerRow[];
  funnel?: FunnelRow[];
  localeBreakdown?: LocaleRow[];
  localeSource?: string;
  window?: string;
  storage?: string;
  error?: string;
};

export default function AdminStatsPage() {
  const tNav = useTranslations("nav");
  const tAdmin = useTranslations("admin.stats");
  const locale = useLocale();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setKeyError(null);
    fetch("/api/stats", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          setAuthenticated(false);
          setKeyError("invalid");
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (json && !json.error) {
          setData(json);
          setAuthenticated(true);
        } else if (json?.error && json.error !== "Invalid key") setData({ error: json.error });
      })
      .catch((e) => setData({ error: String(e) }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include" })
      .then((r) => {
        if (r.ok) {
          setAuthenticated(true);
          fetchStats();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [fetchStats]);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    setLoading(true);
    setKeyError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: key }),
      });
      if (!res.ok) {
        setKeyError("invalid");
        setLoading(false);
        return;
      }
      setKeyInput("");
      setAuthenticated(true);
      fetchStats();
    } catch {
      setKeyError("invalid");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
    setAuthenticated(false);
    setData(null);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = async () => {
    setExportError(null);
    const res = await fetch("/api/stats?format=csv", { credentials: "include" });
    if (res.status === 401) {
      setAuthenticated(false);
      setKeyError("invalid");
      return;
    }
    if (!res.ok) {
      setExportError("failed");
      return;
    }
    const blob = await res.blob();
    const match = res.headers.get("content-disposition")?.match(/filename="([^"]+)"/);
    triggerDownload(blob, match?.[1] ?? "cyprus-winter-kpis.csv");
  };

  const handleDownloadJson = () => {
    if (!data || data.error) return;
    setExportError(null);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    triggerDownload(blob, statsKpiFilename("json", data.window ?? "mtd", new Date()));
  };

  if (!authenticated) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <h1 className={`${TYPE.pageTitle} ${SECTION.headingGap}`}>{tAdmin("title")}</h1>
        <p className="text-sm text-olive/70 mb-6">
          {tAdmin("subtitle")}
        </p>
        <form onSubmit={handleKeySubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); setKeyError(null); }}
            placeholder={tAdmin("key.placeholder")}
            autoComplete="current-password"
            aria-label={tAdmin("key.aria")}
            className="flex-1 min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-2 text-sm text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30"
          />
          <button
            type="submit"
            disabled={!keyInput.trim() || loading}
            className="min-h-[44px] px-5 py-2 rounded-lg bg-terracotta text-white font-semibold hover:bg-terracotta-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tAdmin("key.submit")}
          </button>
        </form>
        {keyError && <p className="text-sm text-terracotta mt-2">{tAdmin("key.invalid")}</p>}
        <div className="mt-8">
          <BackLink href="/" label={tNav("home")} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className={`${TYPE.pageTitle}`}>{tAdmin("title")}</h1>
          <BackLink href="/" label={tNav("home")} />
        </div>
        <div className="space-y-6">
          <div className={`h-8 w-48 ${SKELETON.bar}`} aria-hidden />
          <div className={`h-24 ${SKELETON.block}`} aria-hidden />
          <div className={`h-32 ${SKELETON.block}`} aria-hidden />
        </div>
        <p className="sr-only" role="status" aria-live="polite">{tAdmin("loading")}</p>
      </div>
    );
  }

  const err = (data as StatsData)?.error;
  if (err) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <p className="text-terracotta">{tAdmin("loadError", { error: err })}</p>
      </div>
    );
  }

  const d = data as StatsData;
  const bookings = d.bookingsThisMonth ?? 0;
  const revenue = d.partnerRevenueEur ?? 0;
  const byWinery = d.partnerRevenueByWinery ?? [];
  const funnel = d.funnel ?? [];
  const locales = d.localeBreakdown ?? [];
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const number = new Intl.NumberFormat(locale);

  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className={`${TYPE.pageTitle}`}>{tAdmin("title")}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleDownloadCsv()}
            className={CTA.secondaryCompact}
            aria-label={tAdmin("export.csvAria")}
          >
            {tAdmin("export.csv")}
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className={CTA.secondaryCompact}
            aria-label={tAdmin("export.jsonAria")}
          >
            {tAdmin("export.json")}
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="text-sm text-olive/60 hover:text-olive min-h-[44px] px-2"
          >
            {tAdmin("signOut")}
          </button>
          <BackLink href="/" label={tNav("home")} />
        </div>
      </div>

      <section className="mb-10">
        <h2 className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>{tAdmin("bookingsThisMonth.title")}</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10 mb-6">
          <p className="text-3xl font-bold text-olive">{number.format(bookings)}</p>
          <p className="text-sm text-olive/70 mt-1">{tAdmin("bookingsThisMonth.total")}</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>{tAdmin("partnerRevenueThisMonth.title")}</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10">
          <p className="text-3xl font-bold text-olive">{currency.format(revenue)}</p>
          <p className="text-sm text-olive/70 mt-1">{tAdmin("partnerRevenueThisMonth.subtitle")}</p>
          {byWinery.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {byWinery.map((w) => (
                <li key={w.providerId} className="flex justify-between">
                  <span className="text-olive">{w.providerName}</span>
                  <span className="text-olive/80">{number.format(w.bookingCount)} × {currency.format(w.totalFeeEur)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>{tAdmin("funnelThisMonth.title")}</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10">
          <p className="text-sm text-olive/70 mb-4">{tAdmin("funnelThisMonth.subtitle")}</p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200/80">
                <th className="py-2 font-medium text-olive">{tAdmin("funnelThisMonth.table.event")}</th>
                <th className="py-2 font-medium text-olive text-right">{tAdmin("funnelThisMonth.table.count")}</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((row) => (
                <tr key={row.event} className="border-b border-sand-100">
                  <td className="py-2 text-olive">{row.event}</td>
                  <td className="py-2 text-olive/80 text-right">{number.format(row.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {funnel.length === 0 && (
            <p className="text-sm text-olive/60 py-4">{tAdmin("funnelThisMonth.empty")}</p>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>{tAdmin("localeMix.title")}</h2>
        <div className="p-6 rounded-lg bg-olive/5 border border-olive/10">
          <p className="text-sm text-olive/70 mb-4">{tAdmin("localeMix.subtitle")}</p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200/80">
                <th className="py-2 font-medium text-olive">{tAdmin("localeMix.table.locale")}</th>
                <th className="py-2 font-medium text-olive text-right">{tAdmin("localeMix.table.count")}</th>
              </tr>
            </thead>
            <tbody>
              {locales.map((row) => (
                <tr key={row.locale} className="border-b border-sand-100">
                  <td className="py-2 text-olive">{row.locale}</td>
                  <td className="py-2 text-olive/80 text-right">{number.format(row.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {locales.length === 0 && (
            <p className="text-sm text-olive/60 py-4">{tAdmin("localeMix.empty")}</p>
          )}
        </div>
      </section>

      {exportError && (
        <p className="text-sm text-terracotta mb-6">{tAdmin("export.failed")}</p>
      )}
        </div>
      </section>

      <p className="text-xs text-olive/50">
        {tAdmin("storage", { storage: d.storage ?? tAdmin("storageUnknown") })}
      </p>
    </div>
  );
}

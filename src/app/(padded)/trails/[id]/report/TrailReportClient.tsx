"use client";

import { useState, useRef, useEffect } from "react";
import AppLink from "@/components/AppLink";
import { useParams, notFound } from "next/navigation";
import { trails } from "@/data/trails";
import { LAYOUT, CTA, TYPE } from "@/lib/design-tokens";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useTranslations } from "next-intl";
import { getApiErrorCode, getRetryAfterSeconds, safeJson } from "@/lib/api-client";

const STATUS_VALUES = ["open", "caution", "closed"] as const;
const SURFACE_VALUES = ["dry", "muddy", "snow", "icy"] as const;

export default function TrailReportClient() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tReport = useTranslations("trails.report");
  const params = useParams();
  const id = params?.id as string;
  const trail = typeof id === "string" ? trails.find((t) => t.id === id || t.slug === id) : undefined;

  const [status, setStatus] = useState<"open" | "caution" | "closed">("open");
  const [surface, setSurface] = useState<"dry" | "muddy" | "snow" | "icy">("dry");
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successLinkRef = useRef<HTMLAnchorElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (done && successLinkRef.current) {
      successLinkRef.current.focus({ preventScroll: false });
    }
  }, [done]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus({ preventScroll: true });
    }
  }, [error]);

  useEffect(() => {
    if (!trail) notFound();
  }, [id, trail]);

  if (!trail) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/trail-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trailId: trail.id,
          status,
          surface,
          note: note.trim() || undefined,
          reporterEmail: email.trim() || undefined,
        }),
      });
      const data = await safeJson(res);
      if (!isMountedRef.current) return;
      if (!res.ok) {
        const code = getApiErrorCode(data);
        const retryAfterSeconds = getRetryAfterSeconds(res);
        if (code === "RATE_LIMITED") {
          throw new Error(
            typeof retryAfterSeconds === "number"
              ? tErrors("rateLimited.retryIn", { seconds: retryAfterSeconds })
              : tErrors("api.RATE_LIMITED")
          );
        }
        if (code && tErrors.has(`api.${code}`)) throw new Error(tErrors(`api.${code}`));
        throw new Error(tErrors("common.title"));
      }
      setDone(true);
    } catch (err) {
      if (isMountedRef.current) setError(err instanceof Error ? err.message : tErrors("common.title"));
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <div
          className="p-6 rounded-lg bg-terracotta/10 border border-terracotta/20 text-center"
          role="status"
          aria-live="polite"
          aria-label={tReport("success.aria")}
        >
          <p className={`${TYPE.cardTitle} flex items-center justify-center gap-2`}>
            <span className="w-8 h-8 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center text-sm" aria-hidden>✓</span>
            {tCommon("thanksForReporting")}
          </p>
          <p className="text-sm text-olive/70 mt-2">{tReport("success.body", { region: trail.region })}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <AppLink
              ref={successLinkRef}
              href={`/trails/${trail.id}`}
              className={`min-w-[140px] justify-center ${CTA.primaryCompact}`}
              title={tReport("success.backTitle", { name: trail.name })}
            >
              {tReport("success.backCta", { name: trail.name })}
            </AppLink>
            <AppLink
              href={`/plan?add=${trail.id}`}
              className={`min-w-[140px] justify-center ${CTA.secondaryCompact}`}
              title={tReport("success.addTitle", { name: trail.name })}
            >
              {tReport("success.addCta", { name: trail.name })}
            </AppLink>
            <AppLink
              href="/trails"
              className={`min-w-[140px] justify-center ${CTA.chipTertiary}`}
            >
              {tCommon("reportAnotherTrail")}
            </AppLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className="flex flex-col gap-1 mb-6" aria-label={tCommon("aria.pageNavigation")}>
        <BackLink href={`/trails/${trail.id}`} label={`Back to ${trail.name}`} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("trails"), href: "/trails" },
            { label: trail.name, href: `/trails/${trail.id}` },
            { label: tCommon("breadcrumbs.reportConditions"), href: `/trails/${trail.id}/report`, isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>
      <h1 className={`${TYPE.sectionTitle} text-olive mt-4`}>
        {tCommon("reportConditions")}
      </h1>
      <p className="text-olive/70 text-sm mt-1" id="report-context">
        {tReport.rich("context", {
          name: trail.name,
          strong: (chunks) => <strong className="text-olive/90">{chunks}</strong>,
        })}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
        aria-describedby={error ? "report-error" : undefined}
        noValidate
      >
        <div role="group" aria-labelledby="status-label">
          <label id="status-label" className="block text-sm font-medium text-olive mb-2">{tReport("fields.status")}</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                title={tReport(`options.status.${value}.desc`)}
                onClick={() => setStatus(value)}
                className={status === value ? CTA.chipPrimary : CTA.chipSecondary}
              >
                {tReport(`options.status.${value}.label`)}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-labelledby="surface-label">
          <label id="surface-label" className="block text-sm font-medium text-olive mb-2">{tReport("fields.surface")}</label>
          <div className="flex flex-wrap gap-2">
            {SURFACE_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                title={tReport(`options.surface.${value}.desc`)}
                onClick={() => setSurface(value)}
                className={surface === value ? CTA.chipPrimary : CTA.chipSecondary}
              >
                {tReport(`options.surface.${value}.label`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-olive mb-2">
            {tReport("fields.note")}
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
            placeholder={tReport("placeholders.note")}
          />
          <p className="mt-1 text-xs text-olive/60">{note.length}/500</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-olive mb-2">
            {tReport("fields.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
            placeholder={tReport("placeholders.email")}
          />
        </div>

        {error && (
          <div
            id="report-error"
            ref={errorRef}
            tabIndex={-1}
            className="p-4 rounded-lg bg-terracotta/10 border border-terracotta/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
            role="alert"
          >
            <p className="text-sm text-olive/90 break-words">{error}</p>
            <p className="text-xs text-olive/70 mt-1">{tReport("errorHelp")}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-live="polite"
          className={`w-full py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:disabled:ring-0 ${CTA.primaryCompact}`}
        >
          {loading ? tReport("submit.loading") : tReport("submit.idle")}
        </button>
      </form>
    </div>
  );
}

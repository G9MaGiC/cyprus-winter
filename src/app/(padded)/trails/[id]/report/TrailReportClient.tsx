"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { trails } from "@/data/trails";
import { LAYOUT, CTA } from "@/lib/design-tokens";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";

const STATUS_OPTIONS = [
  { value: "open", label: "Open", desc: "Good to go" },
  { value: "caution", label: "Caution", desc: "Muddy, wind, or minor issues" },
  { value: "closed", label: "Closed", desc: "Snow, ice, or unsafe" },
] as const;

const SURFACE_OPTIONS = [
  { value: "dry", label: "Dry", desc: "Firm ground, good grip" },
  { value: "muddy", label: "Muddy", desc: "Soft or wet patches" },
  { value: "snow", label: "Snow", desc: "Snow on the ground" },
  { value: "icy", label: "Icy", desc: "Ice, may need spikes" },
] as const;

export default function TrailReportClient() {
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
      const data = await res.json();
      if (!isMountedRef.current) return;
      if (!res.ok) {
        const msg =
          data.message ??
          (typeof data.error === "string" ? data.error : data.error?.message) ??
          "Failed to submit";
        throw new Error(msg);
      }
      setDone(true);
    } catch (err) {
      if (isMountedRef.current) setError(err instanceof Error ? err.message : "Didn't save. Try again or head back to the trail.");
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
          aria-label="Report submitted successfully"
        >
          <p className="text-lg font-semibold text-olive flex items-center justify-center gap-2">
            <span className="w-8 h-8 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center text-sm" aria-hidden>✓</span>
            Thanks for reporting.
          </p>
          <p className="text-sm text-olive/70 mt-2">Hikers heading to {trail.region} will use this. Every report counts.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              ref={successLinkRef}
              href={`/trails/${trail.id}`}
              className={`min-w-[140px] justify-center ${CTA.primaryCompact}`}
              title={`Back to ${trail.name}`}
            >
              Back to {trail.name}
            </Link>
            <Link
              href={`/plan?add=${trail.id}`}
              className={`min-w-[140px] justify-center ${CTA.secondaryCompact}`}
              title={`Add ${trail.name} to your plan`}
            >
              Add {trail.name} to your plan
            </Link>
            <Link
              href="/trails"
              className={`min-w-[140px] justify-center ${CTA.chipTertiary}`}
            >
              Report another trail
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className="flex flex-col gap-1 mb-6" aria-label="Page navigation">
        <BackLink href={`/trails/${trail.id}`} label={`Back to ${trail.name}`} />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Trails", href: "/trails" },
            { label: trail.name, href: `/trails/${trail.id}` },
            { label: "Report conditions", href: `/trails/${trail.id}/report`, isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>
      <h1 className="font-display text-2xl font-bold text-olive mt-4">
        Report conditions
      </h1>
      <p className="text-olive/70 text-sm mt-1" id="report-context">
        Reporting: <strong className="text-olive/90">{trail.name}</strong>. Help others by sharing what you saw. Quick and anonymous if you prefer.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
        aria-describedby={error ? "report-error" : undefined}
        noValidate
      >
        <div role="group" aria-labelledby="status-label">
          <label id="status-label" className="block text-sm font-medium text-olive mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                title={o.desc}
                onClick={() => setStatus(o.value)}
                className={status === o.value ? CTA.chipPrimary : CTA.chipSecondary}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-labelledby="surface-label">
          <label id="surface-label" className="block text-sm font-medium text-olive mb-2">Surface</label>
          <div className="flex flex-wrap gap-2">
            {SURFACE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                title={o.desc}
                onClick={() => setSurface(o.value)}
                className={surface === o.value ? CTA.chipPrimary : CTA.chipSecondary}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-olive mb-2">
            Note (optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:ring-offset-0"
            placeholder="e.g. Muddy near the stream crossing. Microspikes helped."
          />
          <p className="mt-1 text-xs text-olive/60">{note.length}/500</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-olive mb-2">
            Email (optional, for verification)
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:ring-offset-0"
            placeholder="your@email.com"
          />
        </div>

        {error && (
          <div
            id="report-error"
            ref={errorRef}
            tabIndex={-1}
            className="p-4 rounded-lg bg-terracotta/10 border border-terracotta/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:ring-offset-2"
            role="alert"
          >
            <p className="text-sm text-olive/90 break-words">{error}</p>
            <p className="text-xs text-olive/70 mt-1">Check your connection, try again, or go back to the trail.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-live="polite"
          className={`w-full py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:disabled:ring-0 ${CTA.primaryCompact}`}
        >
          {loading ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import AppLink from "@/components/AppLink";
import { useSearchParams } from "next/navigation";
import { CTA } from "@/lib/design-tokens";
import { track } from "@/lib/analytics";
import { addBookingToLocal, loadLocalBookings } from "@/lib/bookings-storage";
import { addMutation } from "@/lib/offline-queue";
import { trails } from "@/data/trails";
import type { Guide } from "@/data/guides";
import { useTranslations } from "next-intl";

export default function GuideBookingForm({
  guide,
  preselectedTrailId,
}: {
  guide: Guide;
  preselectedTrailId?: string | null;
}) {
  const t = useTranslations("book.guideForm");
  const tCommon = useTranslations("common");
  const tBookings = useTranslations("bookings");
  const searchParams = useSearchParams();
  const trailFromQuery = preselectedTrailId ?? searchParams.get("trail");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [storageMode, setStorageMode] = useState<"database" | "memory" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const trailOptions = guide.trailIds
    .map((tid) => trails.find((t) => t.id === tid || t.slug === tid))
    .filter(Boolean);

  useEffect(() => {
    if (done && successRef.current) {
      successRef.current.focus({ preventScroll: false });
    }
  }, [done]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const date = formData.get("date") as string;
    const partySize = formData.get("partySize") as string;
    const guestName = formData.get("guestName") as string;
    const guestEmail = formData.get("guestEmail") as string;
    const notes = formData.get("notes") as string;
    const trailId = (formData.get("trailId") as string) || undefined;

    const body = JSON.stringify({
      type: "guide_tour",
      providerId: guide.id,
      date,
      partySize: Number(partySize),
      guestName,
      guestEmail,
      notes: notes || undefined,
      trailId: trailId || undefined,
    });

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.message ??
          (typeof data.error === "string" ? data.error : data.error?.message) ??
          t("errors.failed");
        throw new Error(msg);
      }

      setDone(true);
      setStorageMode(data.storage ?? null);
      form.reset();

      track("booking_complete", {
        guideId: guide.id,
        trailId: trailId || undefined,
        partySize: Number(partySize),
      });
      if (loadLocalBookings().length === 0) {
        track("first_booking", { guideId: guide.id });
      }

      addBookingToLocal(data.booking);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isNetworkError = /failed to fetch|network error/i.test(msg);
      if (isNetworkError && typeof navigator !== "undefined") {
        addMutation({ type: "guide_booking", url: "/api/bookings", method: "POST", body });
      }
      const fallback = t("errors.fallback");
      setError(msg && !isNetworkError ? msg : fallback);
      setTimeout(() => {
        const behavior =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth";
        errorRef.current?.scrollIntoView({ behavior, block: "nearest" });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="mt-8 p-6 rounded-lg bg-sand-100/90 border border-sand-200/70 border-l-4 border-l-aegean/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2"
        role="status"
        aria-live="polite"
      >
        <h2 className="font-display text-xl font-semibold text-olive">{t("success.title")}</h2>
        <p className="text-olive/80 mt-2 leading-relaxed break-words">
          {t("success.body", { guideName: guide.name })}
          {storageMode === "memory" && (
            <>
              {" "}
              {t("success.crossDevicePrefix")}{" "}
              <AppLink href="/bookings" className="text-terracotta underline hover:no-underline">
                {tBookings("title")}
              </AppLink>{" "}
              {t("success.crossDeviceSuffix")}
            </>
          )}
        </p>
        <p className="text-olive/70 text-sm mt-3 break-words">
          {t("success.tip")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <AppLink href="/bookings" className={`gap-2 px-5 py-3 rounded-lg ${CTA.primaryCompact}`}>
            {t("success.ctaBookings")}
          </AppLink>
          <AppLink href="/trails" className={`gap-2 px-5 py-3 rounded-lg ${CTA.secondaryCompact}`}>
            {t("success.ctaTrails")}
          </AppLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {error && (
        <p
          ref={errorRef}
          className="p-3 rounded-lg bg-terracotta/10 text-terracotta text-sm break-words"
          role="alert"
          aria-live="polite"
          tabIndex={-1}
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-olive mb-1">
          {t("fields.date.label")}
        </label>
        <p className="text-xs text-olive/60 mb-2">{t("fields.date.hint")}</p>
        <input
          id="date"
          name="date"
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
        />
      </div>

      {trailOptions.length > 0 && (
        <div>
          <label htmlFor="trailId" className="block text-sm font-medium text-olive mb-1">
            {t("fields.trail.label")} <span className="text-olive/50">{t("fields.trail.optional")}</span>
          </label>
          <p className="text-xs text-olive/60 mb-2">{t("fields.trail.hint")}</p>
          <select
            id="trailId"
            name="trailId"
            defaultValue={
              (() => {
                const match = trailFromQuery && trailOptions.find((t) => t && (t.id === trailFromQuery || t.slug === trailFromQuery));
                return match ? match.id : "";
              })()
            }
            className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
          >
            <option value="">{t("fields.trail.placeholder")}</option>
            {trailOptions.map((trail) =>
              trail ? (
                <option key={trail.id} value={trail.id}>
                  {trail.name}
                </option>
              ) : null
            )}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="partySize" className="block text-sm font-medium text-olive mb-1">
          {t("fields.partySize.label")}
        </label>
        <select
          id="partySize"
          name="partySize"
          required
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {tCommon("peopleCount", { count: n })}
            </option>
          ))}
          <option value="11">{t("fields.partySize.plus")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-olive mb-1">
          {t("fields.guestName.label")}
        </label>
        <input
          id="guestName"
          name="guestName"
          type="text"
          autoComplete="name"
          required
          maxLength={200}
          placeholder={t("fields.guestName.placeholder")}
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
        />
      </div>

      <div>
        <label htmlFor="guestEmail" className="block text-sm font-medium text-olive mb-1">
          {t("fields.guestEmail.label")}
        </label>
        <input
          id="guestEmail"
          name="guestEmail"
          type="email"
          autoComplete="email"
          required
          placeholder={t("fields.guestEmail.placeholder")}
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-olive mb-1">
          {t("fields.notes.label")} <span className="text-olive/50">{t("fields.notes.optional")}</span>
        </label>
        <p className="text-xs text-olive/60 mb-2">
          {t("fields.notes.hint")}
        </p>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          placeholder={t("fields.notes.placeholder")}
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? t("submit.ariaSending") : t("submit.ariaIdle")}
        className={`w-full mt-6 py-4 rounded-lg justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:disabled:ring-0 ${CTA.primaryCompact}`}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin shrink-0" aria-hidden />
        )}
        {loading ? t("submit.sending") : t("submit.idle")}
      </button>
      <p className="text-xs text-olive/50 mt-3 text-center break-words">
        {t("finePrint.bodyPrefix")}{" "}
        <AppLink href="/terms" className="text-olive/70 hover:underline">{t("finePrint.terms")}</AppLink>{" "}
        {t("finePrint.and")}{" "}
        <AppLink href="/privacy" className="text-olive/70 hover:underline">{t("finePrint.privacy")}</AppLink>
        {t("finePrint.bodySuffix")}
      </p>
    </form>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import AppLink from "@/components/AppLink";
import BookingProgressStepper from "@/components/bookings/BookingProgressStepper";
import BookingTrustStrip from "@/components/bookings/BookingTrustStrip";
import { CTA } from "@/lib/design-tokens";
import { track } from "@/lib/analytics";
import { addBookingToLocal, loadLocalBookings } from "@/lib/bookings-storage";
import { addMutation } from "@/lib/offline-queue";
import { useTranslations } from "next-intl";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldCheck() {
  return (
    <span
      className="absolute right-3 top-1/2 -translate-y-1/2 text-aegean text-sm font-bold"
      aria-hidden
    >
      ✓
    </span>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1 text-xs text-terracotta" role="alert">
      {message}
    </p>
  );
}

export default function WineryBookingForm({
  wineryId,
  wineryName,
}: {
  wineryId: string;
  wineryName: string;
}) {
  const t = useTranslations("book.wineryForm");
  const tCommon = useTranslations("common");
  const tBookings = useTranslations("bookings");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [storageMode, setStorageMode] = useState<"database" | "memory" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState({ date: "", guestName: "", guestEmail: "" });
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (done && successRef.current) {
      successRef.current.focus({ preventScroll: false });
    }
  }, [done]);

  useEffect(() => {
    track("booking_trust_strip_view", { type: "winery_tasting", wineryId });
    track("booking_stepper_progress", { type: "winery_tasting", step: 1 });
  }, [wineryId]);

  useEffect(() => {
    if (!done) return;
    track("booking_stepper_progress", { type: "winery_tasting", step: 3 });
  }, [done]);

  const touchField = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const validation = {
    date: fieldValues.date && fieldValues.date >= today,
    guestName: fieldValues.guestName.trim().length > 0,
    guestEmail: EMAIL_RE.test(fieldValues.guestEmail),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Touch all fields to surface errors
    setTouched({ date: true, guestName: true, guestEmail: true });
    if (!validation.date || !validation.guestName || !validation.guestEmail) return;

    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;
    const guestName = formData.get("guestName") as string;
    const guestEmail = formData.get("guestEmail") as string;

    const body = JSON.stringify({
      type: "winery_tasting",
      providerId: wineryId,
      date,
      partySize,
      guestName,
      guestEmail,
      notes: notes || undefined,
    });

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(t("errors.rateLimit"));
        }
        const msg =
          data.message ??
          (typeof data.error === "string" ? data.error : data.error?.message) ??
          t("errors.failed");
        throw new Error(msg);
      }

      setDone(true);
      setStorageMode(data.storage ?? null);
      form.reset();
      setFieldValues({ date: "", guestName: "", guestEmail: "" });

      track("booking_complete", { wineryId, partySize });
      if (loadLocalBookings().length === 0) {
        track("first_booking", { wineryId });
      }

      addBookingToLocal(data.booking);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isNetworkError = /failed to fetch|network error/i.test(msg);
      if (isNetworkError && typeof navigator !== "undefined") {
        addMutation({
          type: "winery_booking",
          url: "/api/bookings",
          method: "POST",
          body,
        });
      }
      const fallback = isNetworkError ? t("errors.offline") : (msg || t("errors.fallback"));
      setError(fallback);
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
        className="mt-8 p-6 rounded-lg bg-sand-100/90 border border-sand-200/70 border-l-4 border-l-terracotta/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
        role="status"
        aria-live="polite"
      >
        <h2 className="font-display text-xl font-semibold text-olive">
          {t("success.title")}
        </h2>
        <p className="text-olive/80 mt-2 leading-relaxed break-words">
          {t("success.body", { wineryName })}
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
        <p className="text-olive/70 text-sm mt-3 break-words">{t("success.tip")}</p>
        <p className="text-olive/70 text-sm mt-2 break-words">{t("success.whatNext")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <AppLink href="/bookings" className={CTA.primaryCompact}>
            {t("success.ctaBookings")}
          </AppLink>
          <AppLink href="/plan" className={CTA.secondaryCompact}>
            {t("success.ctaPlan")}
          </AppLink>
          <AppLink href="/discover" className={CTA.secondaryCompact}>
            {t("success.ctaDiscover")}
          </AppLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
      <BookingProgressStepper currentStep={1} />
      <BookingTrustStrip variant="winery" />

      {/* What to know before you book */}
      <details className="group rounded-lg border border-golden/30 bg-golden/5">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded-lg">
          <span className="text-sm font-medium text-olive/85">{t("whatToKnow.title")}</span>
          <span className="text-olive/50 group-open:rotate-180 transition-transform text-xs" aria-hidden>▾</span>
        </summary>
        <ul className="px-4 pb-4 space-y-1.5 text-sm text-olive/75 list-none">
          <li>✓ {t("whatToKnow.free")}</li>
          <li>✓ {t("whatToKnow.duration")}</li>
          <li>✓ {t("whatToKnow.cancellation")}</li>
        </ul>
      </details>

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
        <div className="relative">
          <input
            id="date"
            name="date"
            type="date"
            required
            min={today}
            value={fieldValues.date}
            onChange={(e) => setFieldValues((p) => ({ ...p, date: e.target.value }))}
            onBlur={() => touchField("date")}
            className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${
              touched.date && !validation.date
                ? "border-terracotta/50 bg-terracotta/5"
                : touched.date && validation.date
                  ? "border-aegean/40 pr-9"
                  : "border-sand-200/80"
            }`}
          />
          {touched.date && validation.date && <FieldCheck />}
        </div>
        {touched.date && !validation.date && (
          <FieldError message={t("fields.date.error")} />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-olive mb-1">
          {t("fields.partySize.label")}
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPartySize((p) => Math.max(1, p - 1))}
            disabled={partySize <= 1}
            aria-label={t("fields.partySize.decrease")}
            className="min-w-[44px] min-h-[44px] rounded-full border border-sand-200/80 text-xl font-medium text-olive flex items-center justify-center hover:bg-sand-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
          >
            −
          </button>
          <span className="text-lg font-semibold text-olive w-16 text-center tabular-nums" aria-live="polite" aria-atomic>
            {partySize === 10 ? "10+" : tCommon("peopleCount", { count: partySize })}
          </span>
          <button
            type="button"
            onClick={() => setPartySize((p) => Math.min(10, p + 1))}
            disabled={partySize >= 10}
            aria-label={t("fields.partySize.increase")}
            className="min-w-[44px] min-h-[44px] rounded-full border border-sand-200/80 text-xl font-medium text-olive flex items-center justify-center hover:bg-sand-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
          >
            +
          </button>
        </div>
        {partySize >= 10 && (
          <p className="mt-1 text-xs text-olive/60">{t("fields.partySize.largeGroupHint")}</p>
        )}
      </div>

      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-olive mb-1">
          {t("fields.guestName.label")}
        </label>
        <div className="relative">
          <input
            id="guestName"
            name="guestName"
            type="text"
            autoComplete="name"
            required
            maxLength={200}
            placeholder={t("fields.guestName.placeholder")}
            value={fieldValues.guestName}
            onChange={(e) => setFieldValues((p) => ({ ...p, guestName: e.target.value }))}
            onBlur={() => touchField("guestName")}
            className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${
              touched.guestName && !validation.guestName
                ? "border-terracotta/50 bg-terracotta/5"
                : touched.guestName && validation.guestName
                  ? "border-aegean/40 pr-9"
                  : "border-sand-200/80"
            }`}
          />
          {touched.guestName && validation.guestName && <FieldCheck />}
        </div>
        {touched.guestName && !validation.guestName && (
          <FieldError message={t("fields.guestName.error")} />
        )}
      </div>

      <div>
        <label htmlFor="guestEmail" className="block text-sm font-medium text-olive mb-1">
          {t("fields.guestEmail.label")}
        </label>
        <div className="relative">
          <input
            id="guestEmail"
            name="guestEmail"
            type="email"
            autoComplete="email"
            required
            placeholder={t("fields.guestEmail.placeholder")}
            value={fieldValues.guestEmail}
            onChange={(e) => setFieldValues((p) => ({ ...p, guestEmail: e.target.value }))}
            onBlur={() => touchField("guestEmail")}
            className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${
              touched.guestEmail && !validation.guestEmail
                ? "border-terracotta/50 bg-terracotta/5"
                : touched.guestEmail && validation.guestEmail
                  ? "border-aegean/40 pr-9"
                  : "border-sand-200/80"
            }`}
          />
          {touched.guestEmail && validation.guestEmail && <FieldCheck />}
        </div>
        {touched.guestEmail && !validation.guestEmail && (
          <FieldError message={t("fields.guestEmail.error")} />
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-olive mb-1">
          {t("fields.notes.label")}{" "}
          <span className="text-olive/50">{t("fields.notes.optional")}</span>
        </label>
        <p className="text-xs text-olive/60 mb-2">{t("fields.notes.hint")}</p>
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
          <span
            className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin shrink-0"
            aria-hidden
          />
        )}
        {loading ? t("submit.sending") : t("submit.idle")}
      </button>
      <p className="text-xs text-olive/50 mt-3 text-center break-words">
        {t("finePrint.bodyPrefix")}{" "}
        <AppLink href="/terms" className="text-olive/70 hover:underline">
          {t("finePrint.terms")}
        </AppLink>{" "}
        {t("finePrint.and")}{" "}
        <AppLink href="/privacy" className="text-olive/70 hover:underline">
          {t("finePrint.privacy")}
        </AppLink>
        {t("finePrint.bodySuffix")}
      </p>
    </form>
  );
}

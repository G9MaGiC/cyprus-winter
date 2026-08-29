"use client";

import { useCallback } from "react";
import AppLink from "@/components/AppLink";
import BookingProgressStepper from "@/components/bookings/BookingProgressStepper";
import BookingTrustStrip from "@/components/bookings/BookingTrustStrip";
import BookingSuccessNextSteps from "@/components/bookings/BookingSuccessNextSteps";
import { useSearchParams } from "next/navigation";
import { CTA, TYPE } from "@/lib/design-tokens";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";
import type { Guide } from "@/data/guides";
import { useTranslations } from "next-intl";
import { guideBookingSchema } from "@/lib/booking-schemas";
import { fieldDescribedBy } from "@/lib/form-a11y";
import { useBookingForm } from "@/hooks/useBookingForm";

export default function GuideBookingForm({
  guide,
  preselectedTrailId,
}: {
  guide: Guide;
  preselectedTrailId?: string | null;
}) {
  const t = useTranslations("book.guideForm");
  const tForm = useTranslations("book.form");
  const tCommon = useTranslations("common");
  const tBookings = useTranslations("bookings");
  const searchParams = useSearchParams();
  const trailFromQuery = preselectedTrailId ?? searchParams.get("trail");

  const trailOptions = guide.trailIds
    .map((tid) => findTrailByIdOrSlug(tid))
    .filter(Boolean);

  const {
    loading,
    done,
    storageMode,
    emailDelayed,
    error,
    fieldErrors,
    notesLength,
    setNotesLength,
    successRef,
    errorRef,
    handleSubmit,
    todayStr,
    validateFieldOnBlur,
  } = useBookingForm(
    {
      type: "guide_tour",
      providerId: guide.id,
      providerName: guide.name,
      schema: guideBookingSchema,
      extraFields: { trailId: undefined },
      analyticsExtra: { guideId: guide.id },
      validationLabels: {
        date: t("validation.dateRequired"),
        guestName: t("validation.nameRequired"),
        guestEmail: t("validation.emailInvalid"),
        partySize: t("validation.partySizeRequired"),
      },
    },
    {
      failed: t("errors.failed"),
      fallback: t("errors.fallback"),
      offlineQueued: t("errors.offlineQueued"),
    }
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      validateFieldOnBlur(e.target.name, e.target.value);
    },
    [validateFieldOnBlur]
  );

  if (done) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="mt-8 space-y-4 focus-visible:outline-none"
        role="status"
        aria-live="polite"
      >
        <BookingProgressStepper currentStep={3} />
        <div className="p-6 rounded-lg bg-sand-100/90 border border-sand-200/70 border-l-4 border-l-aegean/40">
        <h2 className={`${TYPE.subSectionTitle} text-olive`}>{t("success.title")}</h2>
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
        {emailDelayed && (
          <p className="text-olive/80 text-sm mt-3 break-words">
            {t("success.emailDelayed")}
          </p>
        )}
        <BookingSuccessNextSteps namespace="book.guideForm" />
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3 [&_a]:w-full [&_a]:sm:w-auto">
          <AppLink href="/plan" className={`${CTA.primaryCompact} justify-center`}>
            {tCommon("viewPlan")}
          </AppLink>
          <AppLink href="/bookings" className={`${CTA.secondaryCompact} justify-center`}>
            {t("success.ctaBookings")}
          </AppLink>
          <AppLink href="/trails" className={`${CTA.secondaryCompact} justify-center`}>
            {t("success.ctaTrails")}
          </AppLink>
        </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <BookingProgressStepper currentStep={loading ? 2 : 1} />
      <BookingTrustStrip variant="guide" />
      <div className="rounded-lg border border-sand-200/80 bg-sand-100/60 p-3 text-xs text-olive/75">
        <p>
          <strong>{tForm("states.heading")}</strong> {tForm("states.guideBody")}
        </p>
        <p className="mt-1">{tForm("states.offlineQueue")}</p>
      </div>
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
        <p id="date-hint" className="text-xs text-olive/60 mb-2">{t("fields.date.hint")}</p>
        <input
          id="date"
          name="date"
          type="date"
          required
          min={todayStr}
          onBlur={handleBlur}
          aria-invalid={!!fieldErrors.date}
          aria-describedby={fieldDescribedBy("date-hint", fieldErrors.date && "date-error")}
          className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${fieldErrors.date ? "border-terracotta" : "border-sand-200/80"}`}
        />
        {fieldErrors.date && <p id="date-error" className="text-xs text-terracotta mt-1">{fieldErrors.date}</p>}
      </div>

      {trailOptions.length > 0 && (
        <div>
          <label htmlFor="trailId" className="block text-sm font-medium text-olive mb-1">
            {t("fields.trail.label")} <span className="text-olive/50">{t("fields.trail.optional")}</span>
          </label>
          <p id="trail-hint" className="text-xs text-olive/60 mb-2">{t("fields.trail.hint")}</p>
          <select
            id="trailId"
            name="trailId"
            onBlur={handleBlur}
            aria-describedby={fieldDescribedBy("trail-hint")}
            defaultValue={
              (() => {
                if (!trailFromQuery) return "";
                const resolved = findTrailByIdOrSlug(trailFromQuery);
                const match =
                  trailOptions.find((tr) => tr && resolved && tr.id === resolved.id) ??
                  trailOptions.find(
                    (tr) => tr && (tr.id === trailFromQuery || tr.slug === trailFromQuery)
                  );
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
        <p id="partySize-hint" className="sr-only">
          {t("fields.partySize.placeholder")}
        </p>
        <select
          id="partySize"
          name="partySize"
          required
          defaultValue=""
          onBlur={handleBlur}
          aria-invalid={!!fieldErrors.partySize}
          aria-describedby={fieldDescribedBy("partySize-hint", fieldErrors.partySize && "partySize-error")}
          className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${fieldErrors.partySize ? "border-terracotta" : "border-sand-200/80"}`}
        >
          <option value="" disabled>{t("fields.partySize.placeholder")}</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {tCommon("peopleCount", { count: n })}
            </option>
          ))}
          <option value="11">{t("fields.partySize.plus")}</option>
        </select>
        {fieldErrors.partySize && <p id="partySize-error" className="text-xs text-terracotta mt-1">{fieldErrors.partySize}</p>}
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
          onBlur={handleBlur}
          aria-invalid={!!fieldErrors.guestName}
          aria-describedby={fieldErrors.guestName ? "guestName-error" : undefined}
          className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${fieldErrors.guestName ? "border-terracotta" : "border-sand-200/80"}`}
        />
        {fieldErrors.guestName && <p id="guestName-error" className="text-xs text-terracotta mt-1">{fieldErrors.guestName}</p>}
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
          onBlur={handleBlur}
          aria-invalid={!!fieldErrors.guestEmail}
          aria-describedby={fieldDescribedBy(fieldErrors.guestEmail && "guestEmail-error")}
          className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${fieldErrors.guestEmail ? "border-terracotta" : "border-sand-200/80"}`}
        />
        {fieldErrors.guestEmail && <p id="guestEmail-error" className="text-xs text-terracotta mt-1">{fieldErrors.guestEmail}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-olive mb-1">
          {t("fields.notes.label")} <span className="text-olive/50">{t("fields.notes.optional")}</span>
        </label>
        <p id="notes-hint" className="text-xs text-olive/60 mb-2">
          {t("fields.notes.hint")}
        </p>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          placeholder={t("fields.notes.placeholder")}
          onChange={(e) => setNotesLength(e.target.value.length)}
          onBlur={handleBlur}
          aria-describedby={fieldDescribedBy("notes-hint")}
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 resize-none"
        />
        {notesLength > 0 && (
          <p id="notes-count" className="text-xs text-olive/50 mt-1 text-right tabular-nums" aria-live="polite">
            {notesLength}/500
          </p>
        )}
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
        <AppLink href="/terms" className="inline-flex items-center min-h-[44px] py-2 -my-2 text-olive/70 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded">{t("finePrint.terms")}</AppLink>{" "}
        {t("finePrint.and")}{" "}
        <AppLink href="/privacy" className="inline-flex items-center min-h-[44px] py-2 -my-2 text-olive/70 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded">{t("finePrint.privacy")}</AppLink>
        {t("finePrint.bodySuffix")}
      </p>
    </form>
  );
}

"use client";

import { useCallback } from "react";
import AppLink from "@/components/AppLink";
import BookingProgressStepper from "@/components/bookings/BookingProgressStepper";
import BookingTrustStrip from "@/components/bookings/BookingTrustStrip";
import BookingSuccessNextSteps from "@/components/bookings/BookingSuccessNextSteps";
import WineryBookingHints from "@/components/bookings/WineryBookingHints";
import { fieldDescribedBy } from "@/lib/form-a11y";
import { CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";
import { wineryBookingSchema } from "@/lib/booking-schemas";
import { useBookingForm } from "@/hooks/useBookingForm";

export default function WineryBookingForm({
  wineryId,
  wineryName,
  openingHours,
  bestTimeToVisit,
}: {
  wineryId: string;
  wineryName: string;
  openingHours?: string;
  bestTimeToVisit?: string;
}) {
  const t = useTranslations("book.wineryForm");
  const tForm = useTranslations("book.form");
  const tCommon = useTranslations("common");
  const tBookings = useTranslations("bookings");

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
      type: "winery_tasting",
      providerId: wineryId,
      providerName: wineryName,
      schema: wineryBookingSchema,
      analyticsExtra: { wineryId },
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
        <div className="p-6 rounded-lg bg-sand-100/90 border border-sand-200/70 border-s-4 border-s-terracotta/30">
        <h2 className={`${TYPE.subSectionTitle} text-olive`}>
          {t("success.title")}
        </h2>
        <p className="text-muted-ink mt-2 leading-relaxed break-words">
          {t("success.body", { wineryName })}
          {storageMode === "memory" && (
            <>
              {" "}
              {t("success.crossDevicePrefix")}{" "}
              <AppLink href="/bookings" className={SECTION.aegeanLink}>
                {tBookings("title")}
              </AppLink>{" "}
              {t("success.crossDeviceSuffix")}
            </>
          )}
        </p>
        <p className="text-muted-ink text-sm mt-3 break-words">
          {t("success.tip")}
        </p>
        {emailDelayed && (
          <p className="text-muted-ink text-sm mt-3 break-words">
            {t("success.emailDelayed")}
          </p>
        )}
        <BookingSuccessNextSteps namespace="book.wineryForm" />
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3 [&_a]:w-full [&_a]:sm:w-auto">
          <AppLink href="/plan" className={`${CTA.primaryCompact} justify-center`}>
            {tCommon("viewPlan")}
          </AppLink>
          <AppLink href="/bookings" className={`${CTA.secondaryCompact} justify-center`}>
            {t("success.ctaBookings")}
          </AppLink>
          <AppLink href="/discover" className={`${CTA.secondaryCompact} justify-center`}>
            {t("success.ctaDiscover")}
          </AppLink>
        </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <BookingProgressStepper currentStep={loading ? 2 : 1} />
      <BookingTrustStrip variant="winery" />
      <WineryBookingHints openingHours={openingHours} bestTimeToVisit={bestTimeToVisit} />
      <div className="rounded-lg border border-sand-200/80 bg-sand-100/60 p-3 text-xs text-muted-ink">
        <p>
          <strong>{tForm("states.heading")}</strong> {tForm("states.wineryBody")}
        </p>
        <p className="mt-1">{tForm("states.offlineQueue")}</p>
      </div>
      {error && (
        <p ref={errorRef} className="p-3 rounded-lg bg-terracotta/10 text-terracotta-muted text-sm break-words" role="alert" aria-live="polite" tabIndex={-1}>{error}</p>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-olive mb-1">
          {t("fields.date.label")}
        </label>
        <p id="date-hint" className="text-xs text-muted-ink mb-2">
          {t("fields.date.hint")}
        </p>
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
          aria-describedby={fieldDescribedBy(fieldErrors.guestName && "guestName-error")}
          className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive placeholder:text-muted-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${fieldErrors.guestName ? "border-terracotta" : "border-sand-200/80"}`}
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
          className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-olive placeholder:text-muted-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 ${fieldErrors.guestEmail ? "border-terracotta" : "border-sand-200/80"}`}
        />
        {fieldErrors.guestEmail && <p id="guestEmail-error" className="text-xs text-terracotta mt-1">{fieldErrors.guestEmail}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-olive mb-1">
          {t("fields.notes.label")} <span className="text-muted-ink">{t("fields.notes.optional")}</span>
        </label>
        <p id="notes-hint" className="text-xs text-muted-ink mb-2">
          {t("fields.notes.hint")}
        </p>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          placeholder={t("fields.notes.placeholder")}
          onChange={(e) => setNotesLength(e.target.value.length)}
          aria-describedby={fieldDescribedBy("notes-hint")}
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-muted-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 resize-none"
        />
        {notesLength > 0 && (
          <p className="text-xs text-muted-ink mt-1 text-end tabular-nums">{notesLength}/500</p>
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
      <p className="text-xs text-muted-ink mt-3 text-center break-words">
        {t("finePrint.bodyPrefix")}{" "}
        <AppLink href="/terms" className="inline-flex items-center min-h-[44px] py-2 -my-2 text-muted-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded">{t("finePrint.terms")}</AppLink>{" "}
        {t("finePrint.and")}{" "}
        <AppLink href="/privacy" className="inline-flex items-center min-h-[44px] py-2 -my-2 text-muted-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded">{t("finePrint.privacy")}</AppLink>
        {t("finePrint.bodySuffix")}
      </p>
    </form>
  );
}

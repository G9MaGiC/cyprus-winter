"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AppLink from "@/components/AppLink";
import { LAYOUT, CTA, EMPTY_STATE_DASHED, CARD, SECTION, TYPE } from "@/lib/design-tokens";
import { getPlaceById, getGuideById } from "@/data";
import PageHeader from "@/components/PageHeader";
import type { Booking } from "@/lib/bookings";
import { loadLocalBookings, saveLocalBookings, mergeBookings } from "@/lib/bookings-storage";

import { formatDate, daysUntil, getUpcomingDateGroup } from "@/lib/format";
import BookingsEmailLookup from "@/components/BookingsEmailLookup";
import TravelTrustStrip from "@/components/travel/TravelTrustStrip";
import { useLocale, useTranslations } from "next-intl";

function StatusBadge({ status }: { status: Booking["status"] }) {
  const tBookings = useTranslations("bookings");
  const style =
    status === "confirmed"
      ? "bg-aegean/15 text-aegean"
      : status === "cancelled"
        ? "bg-terracotta/15 text-terracotta line-through"
        : "bg-golden/20 text-olive";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      {status === "confirmed" && <span className="w-1.5 h-1.5 rounded-full bg-aegean" aria-hidden />}
      {tBookings(`status.${status}`)}
    </span>
  );
}

export default function BookingsPage() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tBookings = useTranslations("bookings");
  const tBookingsPage = useTranslations("bookings.page");
  const locale = useLocale();
  const isMountedRef = useRef(true);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);
  const [loading, setLoading] = useState(true);
  const [emailLookup, setEmailLookup] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showSync, setShowSync] = useState(false);

  const refreshBookings = useCallback(() => {
    const local = loadLocalBookings();
    setBookings(local);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cyprus-bookings" && isMountedRef.current) {
        refreshBookings();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshBookings]);

  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const fetchByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailLookup.trim();
    if (!email) return;
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!isMountedRef.current) return;
      if (res.status === 429) {
        setEmailError(tBookings("errors.rateLimited"));
        setEmailLoading(false);
        return;
      }
      if (!res.ok) {
        const msg =
          data.message ??
          (typeof data.error === "string" ? data.error : data.error?.message) ??
          tBookings("errors.failedToLoad");
        throw new Error(msg);
      }
      const apiBookings = (data.bookings ?? []) as Booking[];
      const local = loadLocalBookings();
      const merged = mergeBookings(local, apiBookings);
      saveLocalBookings(merged);
      if (!isMountedRef.current) return;
      setBookings(merged);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      if (apiBookings.length === 0) {
        setEmailSuccess(tBookings("emailLookup.noMatch"));
      } else {
        const added = merged.length - local.length;
        setEmailSuccess(
          added > 0
            ? tBookings("emailLookup.loadedCount", { count: added })
            : tBookings("emailLookup.allSet")
        );
      }
      successTimerRef.current = setTimeout(() => {
        successTimerRef.current = null;
        if (isMountedRef.current) setEmailSuccess(null);
      }, 5000);
    } catch (err) {
      if (!isMountedRef.current) return;
      const msg = err instanceof Error ? err.message : "";
      setEmailError(
        msg && !/failed to fetch|network/i.test(msg)
          ? msg
          : tBookings("errors.connection")
      );
    } finally {
      if (isMountedRef.current) setEmailLoading(false);
    }
  };

  const now = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && b.date >= now)
    .sort((a, b) => (a.date > b.date ? 1 : -1));
  const past = bookings
    .filter((b) => b.date < now || b.status === "cancelled")
    .sort((a, b) => (b.date > a.date ? 1 : -1));
  const confirmedCount = upcoming.filter((b) => b.status === "confirmed").length;

  const upcomingByGroup = {
    today: upcoming.filter((b) => getUpcomingDateGroup(b.date) === "today"),
    this_week: upcoming.filter((b) => getUpcomingDateGroup(b.date) === "this_week"),
    later: upcoming.filter((b) => getUpcomingDateGroup(b.date) === "later"),
  };
  const tomorrowBookings = upcoming.filter((b) => daysUntil(b.date) === 1);

  const groupLabels: { key: keyof typeof upcomingByGroup; label: string }[] = [
    { key: "today", label: tBookingsPage("groups.today") },
    { key: "this_week", label: tBookingsPage("groups.thisWeek") },
    { key: "later", label: tBookingsPage("groups.later") },
  ];

  return (
    <div className="min-h-screen bg-sand">
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title={tBookingsPage("title")}
          description={tBookingsPage("description")}
          backHref="/"
          backLabel={tNav("home")}
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("bookings"), href: "/bookings", isCurrent: true }]}
        />

        <TravelTrustStrip className="mb-8" />

        {/* Stats bar */}
        {!loading && bookings.length > 0 && (
          <div className={`flex flex-wrap items-center gap-4 mb-8 rounded-xl ${CARD.base} ${CARD.content}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display font-bold text-terracotta">{bookings.length}</span>
              <span className="text-sm text-olive/70">
                {tBookingsPage("stats.totalBookings", { count: bookings.length })}
              </span>
            </div>
            {upcoming.length > 0 && (
              <>
                <span className="w-px h-6 bg-sand-200" aria-hidden />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-display font-bold text-aegean">{upcoming.length}</span>
                  <span className="text-sm text-olive/70">
                    {tBookingsPage("stats.upcoming")}
                  </span>
                </div>
              </>
            )}
            {confirmedCount > 0 && (
              <>
                <span className="w-px h-6 bg-sand-200" aria-hidden />
                <span className="text-sm text-aegean font-medium">
                  {tBookingsPage("stats.confirmedCount", { count: confirmedCount })}
                </span>
              </>
            )}
          </div>
        )}

        {/* Sync from other device */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowSync(!showSync)}
            aria-expanded={showSync}
            aria-controls="bookings-sync-panel"
            id="bookings-sync-toggle"
            className="flex items-center justify-center min-h-[44px] gap-2 text-sm font-medium text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded w-full sm:w-auto py-2"
          >
            <span aria-hidden className="text-olive/60">{showSync ? "▾" : "▸"}</span>
            {tBookingsPage("sync.toggle")}
          </button>
          {showSync && (
            <div id="bookings-sync-panel" className={`mt-3 rounded-xl ${CARD.base} ${CARD.content}`} role="region" aria-labelledby="bookings-sync-toggle">
              <BookingsEmailLookup
                email={emailLookup}
                onEmailChange={(v) => {
                  setEmailLookup(v);
                  setEmailError(null);
                }}
                loading={emailLoading}
                error={emailError}
                success={emailSuccess}
                onSubmit={fetchByEmail}
                submitLabel={tBookingsPage("sync.submit")}
                onRetry={emailError ? () => setEmailError(null) : undefined}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div
            className="space-y-4"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={tBookingsPage("loading.aria")}
          >
            <p className="sr-only">{tBookingsPage("loading.sr")}</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-white/80 border border-sand-200/80 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="space-y-8" role="region" aria-label={tBookingsPage("empty.aria")}>
            <div className={`${EMPTY_STATE_DASHED} bg-white/80`}>
              <div className={`w-12 h-1 mx-auto rounded-full bg-terracotta/40 ${SECTION.headingGap}`} aria-hidden />
              <h2 className={`${TYPE.cardTitle} ${SECTION.titleGap}`}>
                {tBookings("empty")}
              </h2>
              <p className="text-sm text-olive/60 max-w-md mx-auto break-words mb-8">
                {tBookings("bookMore")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <AppLink
                  href="/discover?filter=winery"
                  className={`w-full sm:w-auto justify-center px-6 py-3 rounded-lg ${CTA.primaryCompact}`}
                >
                  {tBookings("browseWineries")}
                </AppLink>
                <AppLink
                  href="/book/guide"
                  className={`w-full sm:w-auto justify-center px-6 py-3 rounded-lg ${CTA.chipTertiary}`}
                >
                  {tBookingsPage("empty.cta.bookGuidedHike")}
                </AppLink>
                {!showSync && (
                  <button
                    type="button"
                    onClick={() => setShowSync(true)}
                    className={`${CTA.chipTertiary} w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg`}
                  >
                    {tBookingsPage("sync.loadByEmail")}
                  </button>
                )}
              </div>
              {showSync && (
                <div className="pt-4 border-t border-sand-200/80">
                  <p className="text-xs text-olive/50 mb-3">
                    {tBookingsPage("sync.mergeHint")}
                  </p>
                  <BookingsEmailLookup
                    email={emailLookup}
                    onEmailChange={(v) => {
                      setEmailLookup(v);
                      setEmailError(null);
                    }}
                    loading={emailLoading}
                    error={emailError}
                    success={emailSuccess}
                    onSubmit={fetchByEmail}
                    submitLabel={tBookingsPage("sync.submit")}
                    layout="stacked"
                    onRetry={emailError ? () => setEmailError(null) : undefined}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* No upcoming — suggest sync or browse */}
            {bookings.length > 0 && upcoming.length === 0 && (
              <div className="p-5 rounded-xl bg-aegean/10 border border-aegean/20" role="status" aria-live="polite">
                <p className="text-sm font-medium text-olive mb-1">
                  {tBookingsPage("noUpcoming.title")}
                </p>
                <p className="text-sm text-olive/70 mb-4">
                  {tBookingsPage("noUpcoming.body")}
                </p>
                <div className="flex flex-wrap gap-3">
                  {!showSync && (
                    <button
                      type="button"
                      onClick={() => setShowSync(true)}
                      className="inline-flex items-center min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium text-aegean hover:bg-aegean/10 border border-aegean/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {tBookingsPage("sync.loadByEmail")}
                    </button>
                  )}
                  <AppLink
                    href="/discover?filter=winery"
                    className={`px-4 py-2.5 rounded-lg ${CTA.primaryCompact}`}
                  >
                    {tBookings("browseWineries")}
                  </AppLink>
                </div>
              </div>
            )}

            {/* Tomorrow highlight */}
            {tomorrowBookings.length > 0 && (
              <div
                role="status"
                className="mb-6 p-4 rounded-xl bg-aegean/10 border border-aegean/20"
              >
                <p className="text-sm font-medium text-olive">
                  {tBookingsPage("tomorrowHighlight.title", {
                    providers: tomorrowBookings.map((b) => b.providerName).join(" · "),
                  })}
                </p>
                <p className="text-xs text-olive/70 mt-1">
                  {tBookingsPage("tomorrowHighlight.body")}
                </p>
              </div>
            )}

            {/* Upcoming — grouped by Today / This week / Later */}
            {groupLabels.map(
              ({ key, label }) =>
                upcomingByGroup[key].length > 0 && (
                  <section key={key} aria-labelledby={`upcoming-${key}`}>
                    <h2 id={`upcoming-${key}`} className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>
                      {label}
                    </h2>
                    <ul className="space-y-4">
                      {upcomingByGroup[key].map((b) => {
                        const days = daysUntil(b.date);
                        const isTodayOrTomorrow = days === 0 || days === 1;
                        const isGuide = b.type === "guide_tour";
                        const placeValid = !!getPlaceById(b.providerId);
                        const guideValid = !!getGuideById(b.providerId);
                        const providerValid = placeValid || guideValid;
                        const viewHref = isGuide ? "/trails" : `/discover/${b.providerId}`;
                        const viewLabel = isGuide
                          ? tBookingsPage("cta.viewTrails")
                          : tBookingsPage("cta.viewWinery");
                        const modifyHref = isGuide ? `/book/guide/${b.providerId}` : `/book/winery/${b.providerId}?from=bookings`;
                        const todayCopy = isGuide
                          ? tBookingsPage("today.guidedHike")
                          : tBookingsPage("today.tasting");
                        return (
                          <li key={b.id}>
                            <div className={`${CARD.content} rounded-xl ${CARD.base} border-l-4 border-l-aegean/50 hover:shadow-md transition-shadow`}>
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <StatusBadge status={b.status} />
                                    {days >= 0 && days <= 7 && (
                                      <span className="text-xs font-medium text-aegean">
                                        {days === 0
                                          ? tBookingsPage("relative.today")
                                          : days === 1
                                            ? tBookingsPage("relative.tomorrow")
                                            : tBookingsPage("relative.inDays", { count: days })}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`${TYPE.cardTitle} block truncate`}>
                                    {b.providerName}
                                  </span>
                                  <p className="text-sm text-olive/70 mt-1 break-words">
                                    {formatDate(b.date, locale)} · {tCommon("peopleCount", { count: b.partySize })}
                                  </p>
                                  {isTodayOrTomorrow && (
                                    <p className="text-xs text-olive/60 mt-2" role="status">
                                      {days === 0
                                        ? todayCopy
                                        : tBookingsPage("tomorrow.reminder")}
                                    </p>
                                  )}
                                </div>
                                {providerValid && (
                                  <div className="flex flex-wrap gap-2 shrink-0">
                                    <AppLink
                                      href={viewHref}
                                      className={`px-4 py-2 rounded-lg ${CTA.secondaryCompact}`}
                                    >
                                      {viewLabel}
                                    </AppLink>
                                    <AppLink
                                      href={modifyHref}
                                      className={`px-4 py-2 rounded-lg ${CTA.primaryCompact}`}
                                    >
                                      {tBookingsPage("cta.modify")}
                                    </AppLink>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )
            )}

            {/* Past / Cancelled */}
            {past.length > 0 && (
              <section aria-labelledby="past-heading">
                <h2 id="past-heading" className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>
                  {tBookingsPage("past.heading")}
                </h2>
                <ul className="space-y-4">
                  {past.map((b) => {
                    const isGuide = b.type === "guide_tour";
                    const placeValid = !!getPlaceById(b.providerId);
                    const guideValid = !!getGuideById(b.providerId);
                    const providerValid = placeValid || guideValid;
                    const bookAgainHref = isGuide ? `/book/guide/${b.providerId}` : `/book/winery/${b.providerId}?from=bookings`;
                    const secondaryHref = isGuide ? "/trails" : `/discover/${b.providerId}`;
                    const secondaryLabel = isGuide
                      ? tBookingsPage("cta.browseTrails")
                      : tBookingsPage("cta.visitWineryPage");
                    return (
                      <li key={b.id}>
                        <div className={`${CARD.content} rounded-xl bg-sand-100/60 border border-sand-200/80 opacity-90`}>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <StatusBadge status={b.status} />
                          </div>
                          <span className={`${TYPE.cardTitle} text-olive/80 block truncate`}>
                            {b.providerName}
                          </span>
                          <p className="text-sm text-olive/60 mt-1 break-words">
                            {formatDate(b.date, locale)} · {tCommon("peopleCount", { count: b.partySize })}
                          </p>
                          {providerValid && (
                            <div className="mt-3 flex flex-wrap gap-3">
                              <AppLink href={bookAgainHref} className={`px-4 py-2 rounded-lg ${CTA.primaryCompact}`}>
                                {tBookingsPage("cta.bookAgain")}
                              </AppLink>
                              <AppLink href={secondaryHref} className={`${CTA.chipTertiary} px-4 py-2 rounded-lg`}>
                                {secondaryLabel}
                              </AppLink>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* Book more — only when user has bookings; copy varies by context */}
        {bookings.length > 0 && (
          <section className={`mt-12 rounded-xl ${CARD.base} ${CARD.content}`} aria-labelledby="book-more">
            <h2 id="book-more" className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>
              {upcoming.length === 0
                ? tBookingsPage("bookMore.titleNoUpcoming")
                : tBookingsPage("bookMore.title")}
            </h2>
            <p className={`text-sm text-olive/70 ${SECTION.headingGap} break-words`}>
              {upcoming.length === 0
                ? tBookingsPage("bookMore.bodyNoUpcoming")
                : tBookingsPage("bookMore.body")}
            </p>
            <div className="flex flex-wrap gap-3">
              <AppLink
                href="/discover?filter=winery"
                className={`px-5 py-3 rounded-lg ${CTA.primaryCompact}`}
              >
                {tBookings("browseWineries")}
              </AppLink>
              <AppLink href="/book/guide" className={`${CTA.chipTertiary} px-5 py-3 rounded-lg`}>
                {tBookingsPage("empty.cta.bookGuidedHike")}
              </AppLink>
              <AppLink href="/discover" className={`${CTA.chipTertiary} px-5 py-3 rounded-lg`}>
                {tBookingsPage("cta.discoverAll")}
              </AppLink>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

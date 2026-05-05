"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { LAYOUT, CTA, EMPTY_STATE_DASHED, CARD, SECTION } from "@/lib/design-tokens";
import { getPlaceById, getGuideById } from "@/data";
import PageHeader from "@/components/PageHeader";
import type { Booking } from "@/lib/bookings";
import { loadLocalBookings, saveLocalBookings, mergeBookings } from "@/lib/bookings-storage";

import { formatDate, daysUntil, getUpcomingDateGroup } from "@/lib/format";
import BookingsEmailLookup from "@/components/BookingsEmailLookup";

function StatusBadge({ status }: { status: Booking["status"] }) {
  const style =
    status === "confirmed"
      ? "bg-aegean/15 text-aegean"
      : status === "cancelled"
        ? "bg-terracotta/15 text-terracotta line-through"
        : "bg-golden/20 text-olive";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      {status === "confirmed" && <span className="w-1.5 h-1.5 rounded-full bg-aegean" aria-hidden />}
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const isMountedRef = useRef(true);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentHandledRef = useRef(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newBookingIntent, setNewBookingIntent] = useState(false);

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

  /** `/bookings?intent=new` — from Plan winery bar; scroll to booking paths and strip query without Suspense. */
  useEffect(() => {
    if (intentHandledRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("intent") !== "new") return;
    intentHandledRef.current = true;
    setNewBookingIntent(true);
    const clean = new URL(window.location.href);
    clean.searchParams.delete("intent");
    window.history.replaceState(null, "", `${clean.pathname}${clean.search}${clean.hash}`);
  }, []);

  useEffect(() => {
    if (!newBookingIntent) return;
    requestAnimationFrame(() => {
      document.getElementById("bookings-new-intent")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [newBookingIntent]);

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
        setEmailError("Too many requests. Wait a moment and try again.");
        setEmailLoading(false);
        return;
      }
      if (!res.ok) {
        const msg =
          data.message ??
          (typeof data.error === "string" ? data.error : data.error?.message) ??
          "Failed to load";
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
        setEmailSuccess("No bookings for that email. Try another, or book from Discover.");
      } else {
        const added = merged.length - local.length;
        setEmailSuccess(added > 0 ? `Loaded ${added} booking${added === 1 ? "" : "s"}.` : "All set. No new bookings to load.");
      }
      successTimerRef.current = setTimeout(() => {
        successTimerRef.current = null;
        if (isMountedRef.current) setEmailSuccess(null);
      }, 5000);
    } catch (err) {
      if (!isMountedRef.current) return;
      const msg = err instanceof Error ? err.message : "";
      setEmailError(
        msg && !/failed to fetch|network/i.test(msg) ? msg : "Couldn't load your bookings. Check your connection and try again."
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
    { key: "today", label: "Today" },
    { key: "this_week", label: "This week" },
    { key: "later", label: "Later" },
  ];

  return (
    <div className="min-h-screen bg-sand">
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title="My bookings"
          description="Your tastings and experiences. All in one place."
          backHref="/"
          backLabel="Home"
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "My bookings", href: "/bookings", isCurrent: true }]}
        />

        <p className="text-sm text-olive/75 leading-relaxed mb-8 max-w-2xl">
          Everything you book on this device appears here right away. Booked on another phone or laptop? Enter the{" "}
          <span className="text-olive/90 font-medium">same email you used on the booking form</span> in the section
          below—we&apos;ll merge what we find with this device. Nothing you already have here is removed.
        </p>

        {newBookingIntent && (
          <div
            id="bookings-new-intent"
            className="mb-8 p-4 sm:p-5 rounded-xl border border-terracotta/25 bg-terracotta/5"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-olive mb-1">Start a new booking</p>
            <p className="text-sm text-olive/70 mb-4">
              Choose a winery or guided experience, then complete the booking form. You can also load existing bookings by email below.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href="/discover?filter=winery"
                className={`inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg text-center ${CTA.primaryCompact}`}
              >
                Browse wineries
              </Link>
              <Link
                href="/book/guide"
                className={`inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg text-center ${CTA.chipTertiary}`}
              >
                Book a guided hike
              </Link>
            </div>
          </div>
        )}

        {/* Stats bar */}
        {!loading && bookings.length > 0 && (
          <div className={`flex flex-wrap items-center gap-4 mb-8 rounded-xl ${CARD.base} ${CARD.content}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display font-bold text-terracotta">{bookings.length}</span>
              <span className="text-sm text-olive/70">
                {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>
            {upcoming.length > 0 && (
              <>
                <span className="w-px h-6 bg-sand-200" aria-hidden />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-display font-bold text-aegean">{upcoming.length}</span>
                  <span className="text-sm text-olive/70">upcoming</span>
                </div>
              </>
            )}
            {confirmedCount > 0 && (
              <>
                <span className="w-px h-6 bg-sand-200" aria-hidden />
                <span className="text-sm text-aegean font-medium">{confirmedCount} confirmed</span>
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
            Booked on another device? Load by email
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
                submitLabel="Load bookings"
                onRetry={emailError ? () => setEmailError(null) : undefined}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4" role="status" aria-live="polite" aria-busy="true" aria-label="Loading your bookings">
            <p className="sr-only">Loading your bookings…</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-white/80 border border-sand-200/80 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="space-y-8" role="region" aria-label="Empty bookings state">
            <div className={`${EMPTY_STATE_DASHED} bg-white/80`}>
              <div className={`w-12 h-1 mx-auto rounded-full bg-terracotta/40 ${SECTION.headingGap}`} aria-hidden />
              <h2 className="font-display font-semibold text-olive mb-1">No bookings yet</h2>
              <p className="text-sm text-olive/60 max-w-md mx-auto break-words mb-8">
                When you reserve a tasting or guided hike, it will show up here. Book from Discover or Trails, or load
                past bookings by email if you used another device.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <Link
                  href="/discover?filter=winery"
                  className={`w-full sm:w-auto justify-center px-6 py-3 rounded-lg ${CTA.primaryCompact}`}
                >
                  Browse wineries
                </Link>
                <Link
                  href="/book/guide"
                  className={`w-full sm:w-auto justify-center px-6 py-3 rounded-lg ${CTA.chipTertiary}`}
                >
                  Book a guided hike
                </Link>
                {!showSync && (
                  <button
                    type="button"
                    onClick={() => setShowSync(true)}
                    className={`${CTA.chipTertiary} w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg`}
                  >
                    Load by email
                  </button>
                )}
              </div>
              {showSync && (
                <div className="pt-4 border-t border-sand-200/80">
                  <p className="text-xs text-olive/50 mb-3">We’ll merge any bookings with this device.</p>
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
                    submitLabel="Load bookings"
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
                <p className="text-sm font-medium text-olive mb-1">No upcoming bookings</p>
                <p className="text-sm text-olive/70 mb-4">Load bookings from another device or plan your next visit.</p>
                <div className="flex flex-wrap gap-3">
                  {!showSync && (
                    <button
                      type="button"
                      onClick={() => setShowSync(true)}
                      className="inline-flex items-center min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium text-aegean hover:bg-aegean/10 border border-aegean/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Load by email
                    </button>
                  )}
                  <Link
                    href="/discover?filter=winery"
                    className={`px-4 py-2.5 rounded-lg ${CTA.primaryCompact}`}
                  >
                    Browse wineries
                  </Link>
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
                  Tomorrow — {tomorrowBookings.map((b) => b.providerName).join(" · ")} — directions ready.
                </p>
                <p className="text-xs text-olive/70 mt-1">
                  View details below or add to your plan.
                </p>
              </div>
            )}

            {/* Upcoming — grouped by Today / This week / Later */}
            {groupLabels.map(
              ({ key, label }) =>
                upcomingByGroup[key].length > 0 && (
                  <section key={key} aria-labelledby={`upcoming-${key}`}>
                    <h2 id={`upcoming-${key}`} className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>
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
                        const viewLabel = isGuide ? "View trails" : "View winery";
                        const modifyHref = isGuide ? `/book/guide/${b.providerId}` : `/book/winery/${b.providerId}`;
                        const todayCopy = isGuide
                          ? "Your guided hike is today — see details below."
                          : "Your tasting is today — see winery details below.";
                        return (
                          <li key={b.id}>
                            <div className={`${CARD.content} rounded-xl ${CARD.base} border-l-4 border-l-aegean/50 hover:shadow-md transition-shadow`}>
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <StatusBadge status={b.status} />
                                    {days >= 0 && days <= 7 && (
                                      <span className="text-xs font-medium text-aegean">
                                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-display font-semibold text-olive block line-clamp-2 break-words">
                                    {b.providerName}
                                  </span>
                                  <p className="text-sm text-olive/70 mt-1 break-words">
                                    {formatDate(b.date)} · {b.partySize} {b.partySize === 1 ? "person" : "people"}
                                  </p>
                                  {isTodayOrTomorrow && (
                                    <p className="text-xs text-olive/60 mt-2" role="status">
                                      {days === 0 ? todayCopy : "Tomorrow — set a reminder if you like."}
                                    </p>
                                  )}
                                </div>
                                {providerValid && (
                                  <div className="flex flex-wrap gap-2 shrink-0">
                                    <Link
                                      href={viewHref}
                                      className={`px-4 py-2 rounded-lg ${CTA.secondaryCompact}`}
                                    >
                                      {viewLabel}
                                    </Link>
                                    <Link
                                      href={modifyHref}
                                      className={`px-4 py-2 rounded-lg ${CTA.primaryCompact}`}
                                    >
                                      Modify
                                    </Link>
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
                <h2 id="past-heading" className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>
                  Past & cancelled
                </h2>
                <ul className="space-y-4">
                  {past.map((b) => {
                    const isGuide = b.type === "guide_tour";
                    const placeValid = !!getPlaceById(b.providerId);
                    const guideValid = !!getGuideById(b.providerId);
                    const providerValid = placeValid || guideValid;
                    const bookAgainHref = isGuide ? `/book/guide/${b.providerId}` : `/book/winery/${b.providerId}`;
                    const secondaryHref = isGuide ? "/trails" : `/discover/${b.providerId}`;
                    const secondaryLabel = isGuide ? "Browse trails" : "Visit winery page";
                    return (
                      <li key={b.id}>
                        <div className={`${CARD.content} rounded-xl bg-sand-100/60 border border-sand-200/80 opacity-90`}>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <StatusBadge status={b.status} />
                          </div>
                          <span className="font-display font-semibold text-olive/80 block line-clamp-2 break-words">
                            {b.providerName}
                          </span>
                          <p className="text-sm text-olive/60 mt-1 break-words">
                            {formatDate(b.date)} · {b.partySize} {b.partySize === 1 ? "person" : "people"}
                          </p>
                          {providerValid && (
                            <div className="mt-3 flex flex-wrap gap-3">
                              <Link href={bookAgainHref} className={`px-4 py-2 rounded-lg ${CTA.primaryCompact}`}>
                                Book again
                              </Link>
                              <Link href={secondaryHref} className={`${CTA.chipTertiary} px-4 py-2 rounded-lg`}>
                                {secondaryLabel}
                              </Link>
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
            <h2 id="book-more" className={`font-display font-semibold text-olive ${SECTION.headingGap}`}>
              {upcoming.length === 0 ? "Plan your next visit" : "Book more"}
            </h2>
            <p className={`text-sm text-olive/70 ${SECTION.headingGap} break-words`}>
              {upcoming.length === 0
                ? "All your tastings are in the past. Book another for your next trip."
                : "Add another tasting to your winter trip."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/discover?filter=winery"
                className={`px-5 py-3 rounded-lg ${CTA.primaryCompact}`}
              >
                Browse wineries
              </Link>
              <Link href="/book/guide" className={`${CTA.chipTertiary} px-5 py-3 rounded-lg`}>
                Book a guided hike
              </Link>
              <Link href="/discover" className={`${CTA.chipTertiary} px-5 py-3 rounded-lg`}>
                Discover all
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { LAYOUT, CTA, EMPTY_STATE_DASHED, CARD } from "@/lib/design-tokens";
import { getPlaceById } from "@/data";
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
  const [bookings, setBookings] = useState<Booking[]>([]);
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
      setBookings(merged);
      if (apiBookings.length === 0) {
        setEmailSuccess("No bookings for that address. Try another, or book from Discover.");
      } else {
        const added = merged.length - local.length;
        setEmailSuccess(added > 0 ? `Loaded ${added} booking${added === 1 ? "" : "s"}.` : "All set. No new bookings to load.");
      }
      setTimeout(() => setEmailSuccess(null), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setEmailError(
        msg && !/failed to fetch|network/i.test(msg) ? msg : "Couldn't load your bookings. Check your connection and try again."
      );
    } finally {
      setEmailLoading(false);
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
        />

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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sand-200/80 flex items-center justify-center text-2xl text-olive/40" aria-hidden>
                🍷
              </div>
              <h2 className="font-display font-semibold text-olive mb-1">No bookings yet</h2>
              <p className="text-sm text-olive/60 max-w-md mx-auto break-words mb-8">
                Book a tasting from Discover, or load bookings from another device.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <Link
                  href="/discover?filter=winery"
                  className={`w-full sm:w-auto justify-center px-6 py-3 rounded-lg ${CTA.primaryCompact}`}
                >
                  Browse wineries
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
                <p className="text-sm font-medium text-olive mb-1">No upcoming tastings</p>
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

            {/* Upcoming — grouped by Today / This week / Later */}
            {groupLabels.map(
              ({ key, label }) =>
                upcomingByGroup[key].length > 0 && (
                  <section key={key} aria-labelledby={`upcoming-${key}`}>
                    <h2 id={`upcoming-${key}`} className="font-display text-lg font-semibold text-olive mb-4">
                      {label}
                    </h2>
                    <ul className="space-y-4">
                      {upcomingByGroup[key].map((b) => {
                        const days = daysUntil(b.date);
                        const isTodayOrTomorrow = days === 0 || days === 1;
                        const providerValid = !!getPlaceById(b.providerId);
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
                                  {providerValid ? (
                                    <Link
                                      href={`/discover/${b.providerId}`}
                                      className="font-display font-semibold text-olive hover:text-terracotta transition-colors block truncate"
                                    >
                                      {b.providerName}
                                    </Link>
                                  ) : (
                                    <span className="font-display font-semibold text-olive block truncate">
                                      {b.providerName}
                                    </span>
                                  )}
                                  <p className="text-sm text-olive/70 mt-1 break-words">
                                    {formatDate(b.date)} · {b.partySize} {b.partySize === 1 ? "person" : "people"}
                                  </p>
                                  {isTodayOrTomorrow && (
                                    <p className="text-xs text-olive/60 mt-2" role="status">
                                      {days === 0
                                        ? "Your tasting is today — see winery details below."
                                        : "Tomorrow — set a reminder if you like."}
                                    </p>
                                  )}
                                </div>
                                {providerValid && (
                                  <div className="flex flex-wrap gap-2 shrink-0">
                                    <Link
                                      href={`/discover/${b.providerId}`}
                                      className={`px-4 py-2 rounded-lg ${CTA.secondaryCompact}`}
                                    >
                                      View winery
                                    </Link>
                                    <Link
                                      href={`/book/winery/${b.providerId}`}
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
                <h2 id="past-heading" className="font-display text-lg font-semibold text-olive mb-4">
                  Past & cancelled
                </h2>
                <ul className="space-y-4">
                  {past.map((b) => {
                    const providerValid = !!getPlaceById(b.providerId);
                    return (
                    <li key={b.id}>
                      <div className={`${CARD.content} rounded-xl bg-sand-100/60 border border-sand-200/80 opacity-90`}>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <StatusBadge status={b.status} />
                        </div>
                        {providerValid ? (
                          <Link
                            href={`/discover/${b.providerId}`}
                            className="font-display font-semibold text-olive/80 hover:text-terracotta transition-colors block truncate"
                          >
                            {b.providerName}
                          </Link>
                        ) : (
                          <span className="font-display font-semibold text-olive/80 block truncate">
                            {b.providerName}
                          </span>
                        )}
                        <p className="text-sm text-olive/60 mt-1 break-words">
                          {formatDate(b.date)} · {b.partySize} {b.partySize === 1 ? "person" : "people"}
                        </p>
                        {providerValid && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Link
                            href={`/book/winery/${b.providerId}`}
                            className={`px-4 py-2 rounded-lg ${CTA.primaryCompact}`}
                          >
                            Book again
                          </Link>
                          <Link
                            href={`/discover/${b.providerId}`}
                            className={`${CTA.chipTertiary} px-4 py-2 rounded-lg`}
                          >
                            Visit winery page
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
            <h2 id="book-more" className="font-display font-semibold text-olive mb-3">
              {upcoming.length === 0 ? "Plan your next visit" : "Book more"}
            </h2>
            <p className="text-sm text-olive/70 mb-4 break-words">
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
              <Link
                href="/discover"
                className={`${CTA.chipTertiary} px-5 py-3 rounded-lg`}
              >
                Discover all
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

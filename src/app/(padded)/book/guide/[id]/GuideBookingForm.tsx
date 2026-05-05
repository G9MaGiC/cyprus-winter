"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { CTA } from "@/lib/design-tokens";
import { track } from "@/lib/analytics";
import { addBookingToLocal, loadLocalBookings } from "@/lib/bookings-storage";
import { addMutation } from "@/lib/offline-queue";
import { trails } from "@/data/trails";
import type { Guide } from "@/data/guides";

export default function GuideBookingForm({
  guide,
  preselectedTrailId,
}: {
  guide: Guide;
  preselectedTrailId?: string | null;
}) {
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
          "Booking failed";
        throw new Error(msg);
      }

      if (loadLocalBookings().length === 0) {
        track("first_booking", { guideId: guide.id });
      }
      addBookingToLocal(data.booking);

      setDone(true);
      setStorageMode(data.storage ?? null);
      form.reset();

      track("booking_complete", {
        guideId: guide.id,
        trailId: trailId || undefined,
        partySize: Number(partySize),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isNetworkError = /failed to fetch|network error/i.test(msg);
      if (isNetworkError && typeof navigator !== "undefined") {
        addMutation({ type: "guide_booking", url: "/api/bookings", method: "POST", body });
      }
      const fallback = "Something went wrong — check your connection and try again.";
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
        <h2 className="font-display text-xl font-semibold text-olive">Request sent</h2>
        <p className="text-olive/80 mt-2 leading-relaxed break-words">
          Your hike request for {guide.name} is on its way. They&apos;ll confirm by email. If you
          don&apos;t hear back within a day or two, give them a call.
          {storageMode === "memory" && (
            <>
              {" "}
              Enter your email on{" "}
              <Link href="/bookings" className="text-terracotta underline hover:no-underline">
                My Bookings
              </Link>{" "}
              to view your request across devices.
            </>
          )}
        </p>
        <p className="text-olive/70 text-sm mt-3 break-words">
          Pack layers and water. Tell someone your route.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/bookings" className={`gap-2 px-5 py-3 rounded-lg ${CTA.primaryCompact}`}>
            View my bookings
          </Link>
          <Link href="/trails" className={`gap-2 px-5 py-3 rounded-lg ${CTA.secondaryCompact}`}>
            Browse trails
          </Link>
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
          Preferred date
        </label>
        <p className="text-xs text-olive/60 mb-2">Winter days are short; book ahead for your preferred slot.</p>
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
            Trail <span className="text-olive/50">(optional)</span>
          </label>
          <p className="text-xs text-olive/60 mb-2">Optional. Helps the guide plan.</p>
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
            <option value="">Select a trail (optional)</option>
            {trailOptions.map((t) =>
              t ? (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ) : null
            )}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="partySize" className="block text-sm font-medium text-olive mb-1">
          Group size
        </label>
        <select
          id="partySize"
          name="partySize"
          required
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "person" : "people"}
            </option>
          ))}
          <option value="11">11+ people</option>
        </select>
      </div>

      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-olive mb-1">
          Your name
        </label>
        <input
          id="guestName"
          name="guestName"
          type="text"
          autoComplete="name"
          required
          maxLength={200}
          placeholder="John Smith"
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
        />
      </div>

      <div>
        <label htmlFor="guestEmail" className="block text-sm font-medium text-olive mb-1">
          Email
        </label>
        <input
          id="guestEmail"
          name="guestEmail"
          type="email"
          autoComplete="email"
          required
          placeholder="john@example.com"
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-olive mb-1">
          Notes <span className="text-olive/50">(optional)</span>
        </label>
        <p className="text-xs text-olive/60 mb-2">
          Fitness level, experience, trail preference—whatever helps them plan.
        </p>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="First winter hike, want to see waterfalls, need an early start — whatever helps"
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-3 text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-0 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? "Sending your request" : "Request guided hike"}
        className={`w-full mt-6 py-4 rounded-lg justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:disabled:ring-0 ${CTA.primaryCompact}`}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin shrink-0" aria-hidden />
        )}
        {loading ? "Sending…" : "Request guided hike"}
      </button>
      <p className="text-xs text-olive/50 mt-3 text-center break-words">
        This is a request, not a confirmed reservation. They&apos;ll confirm by email. By submitting, you agree to our{" "}
        <Link href="/terms" className="text-olive/70 hover:underline">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="text-olive/70 hover:underline">Privacy Policy</Link>.
      </p>
    </form>
  );
}

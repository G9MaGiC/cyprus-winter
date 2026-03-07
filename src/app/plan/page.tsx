"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ListPageHero from "@/components/ListPageHero";
import ListPageWidgetStrip from "@/components/ListPageWidgetStrip";
import ItineraryCard from "@/components/ItineraryCard";
import ClearDayModal from "@/components/plan/ClearDayModal";
import PlanStickyAddBar from "@/components/plan/PlanStickyAddBar";
import PlacePickerModal from "@/components/plan/PlacePickerModal";
import SuggestedForDay from "@/components/SuggestedForDay";
import TemplateChoiceModal from "@/components/plan/TemplateChoiceModal";
import ShareLinks from "@/components/ShareLinks";
import { useSearchParams, useRouter } from "next/navigation";
import { LAYOUT, SECTION, CARD, CTA, EMPTY_STATE_DASHED, TYPE, PILL, CALLOUT } from "@/lib/design-tokens";
import { useItinerary, MAX_DAYS } from "@/hooks/useItinerary";
import { useTripDates } from "@/hooks/useTripDates";
import PushOptIn from "@/components/PushOptIn";

const TEMPLATES = [
  { key: "classic" as const, label: "Classic", sub: "Coast, culture, hill villages" },
  { key: "mountain" as const, label: "Mountain", sub: "Troodos trails & stone villages" },
  { key: "coast-culture" as const, label: "Coast & Culture", sub: "Beaches, ruins, wine" },
  { key: "family" as const, label: "Family", sub: "Gentle pace, 2–3 stops a day" },
  { key: "short-stay" as const, label: "Short stay", sub: "48 hours: trail, village, wine" },
];

export default function PlanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showClearModal, setShowClearModal] = useState(false);
  const [templateChoice, setTemplateChoice] = useState<string | null>(null);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const shareMenuFirstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!shareMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false);
        requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
      }
    };
    document.addEventListener("click", close, { capture: true });
    return () => document.removeEventListener("click", close, { capture: true });
  }, [shareMenuOpen]);

  useEffect(() => {
    if (shareMenuOpen) shareMenuFirstItemRef.current?.focus();
  }, [shareMenuOpen]);
  const { dates, setTripDates, hydrated: datesHydrated, daysUntil, withinSevenDays } = useTripDates();
  const {
    days,
    activeDay,
    setActiveDay,
    hydrated,
    copied,
    addToDay,
    removeFromDay,
    getPlace,
    lastAddedId,
    hasContent,
    hasWineries,
    applyTemplate,
    mergeTemplate,
    clearDay,
    copyItinerary,
    copyShareLink,
    linkCopied,
    sharePath,
  } = useItinerary();

  const activeItems = days[activeDay] ?? [];
  const totalPlaces = Object.values(days).flat().length;
  const activeDaysCount = Object.keys(days).filter((d) => (days[Number(d)] ?? []).length > 0).length;
  const processedAddRef = useRef<string | null>(null);
  const processedTemplateRef = useRef<string | null>(null);
  const lastAddedCardRef = useRef<HTMLDivElement | null>(null);
  const quickStartRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const template = searchParams.get("template");
    if (template !== "short-stay" || processedTemplateRef.current === "short-stay") return;
    if (!hasContent) {
      processedTemplateRef.current = "short-stay";
      applyTemplate("short-stay");
      router.replace("/plan", { scroll: false });
    }
  }, [hydrated, searchParams, hasContent, applyTemplate, router]);

  useEffect(() => {
    if (lastAddedId && lastAddedCardRef.current) {
      lastAddedCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [lastAddedId]);

  useEffect(() => {
    if (!hydrated) return;
    const addId = searchParams.get("add");
    if (!addId || addId === "failed" || processedAddRef.current === addId) return;
    processedAddRef.current = addId;
    const place = getPlace(addId);
    if (!place) {
      router.replace("/plan?add=failed", { scroll: false });
      return;
    }
    addToDay(place.id);
    router.replace("/plan", { scroll: false });
    // Ensure day selector shows the day we added to (activeDay)
  }, [hydrated, searchParams, addToDay, getPlace, router]);

  type TemplateKey = "classic" | "mountain" | "coast-culture" | "family" | "short-stay";
  const handleTemplateClick = (key: string) => {
    if (!hasContent) {
      applyTemplate(key as TemplateKey);
      return;
    }
    setTemplateChoice(key);
  };

  const handleReplaceTemplate = () => {
    if (!templateChoice) return;
    applyTemplate(templateChoice as TemplateKey, true);
    setTemplateChoice(null);
  };

  const handleAddTemplate = () => {
    if (!templateChoice) return;
    mergeTemplate(templateChoice as TemplateKey);
    setTemplateChoice(null);
  };

  return (
    <div className="min-h-screen bg-sand">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} ${SECTION.blockGap} pb-24 sm:pb-16`}>
        {copied && (
          <div className="sr-only" role="status" aria-live="polite">
            Itinerary copied to clipboard
          </div>
        )}
        {linkCopied && (
          <div className="sr-only" role="status" aria-live="polite">
            Share link copied to clipboard
          </div>
        )}

        {searchParams.get("add") && !hydrated && (
          <p className="text-sm text-olive/70 mb-4" role="status" aria-live="polite">
            Adding to your plan…
          </p>
        )}

        {searchParams.get("add") === "failed" && (
          <div
            className="mb-4 p-4 rounded-xl bg-terracotta/10 border border-terracotta/30 text-sm text-olive"
            role="alert"
            aria-live="assertive"
          >
            <p className="mb-3">That place isn&apos;t in our list anymore.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/discover" className={CTA.secondaryCompact}>
                Browse Discover
              </Link>
              <Link href="/trails" className={CTA.secondaryCompact}>
                View trails
              </Link>
            </div>
          </div>
        )}

        <header role="banner">
          <ListPageHero
            backHref="/"
            backLabel="Home"
            title="Plan your Cyprus winter trip"
            description="Pick a template or add places. Your plan saves as you go."
            backgroundImage="/images/cyprus/cyprus-village-omodos.jpg"
            backgroundImageAlt="Omodos village, wine heartland—plan your Cyprus winter trip"
            hasWidgetStrip
          >
            <div
              className={`mt-3 sm:mt-8 ${CARD.contentLg} ${
                hasContent ? `${CARD.base}` : "border-0 shadow-none bg-transparent"
              }`}
            >
              {!hasContent && (
                <button
                      type="button"
                      onClick={() => quickStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className={`mb-4 sm:mb-0 sm:mt-6 ${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100 w-full sm:w-auto`}
                    >
                  Pick a template or add your first place
                </button>
              )}
              {hasContent && hydrated && (
                <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
                  <p className="text-sm text-olive/70" aria-live="polite" role="status">
                    <span className="font-semibold text-terracotta tabular-nums">{totalPlaces}</span> places ·{" "}
                    <span className="font-semibold text-aegean tabular-nums">{activeDaysCount}</span>/{MAX_DAYS} days · Auto-saved
                  </p>
                  <div className="relative" ref={shareMenuRef}>
                    <button
                      ref={shareMenuTriggerRef}
                      type="button"
                      onClick={() => setShareMenuOpen((v) => !v)}
                      className="min-h-[44px] inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-olive/80 hover:text-terracotta hover:bg-terracotta/5 border border-sand-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
                      aria-expanded={shareMenuOpen}
                      aria-haspopup="true"
                    >
                      Copy & share
                      <span className={`text-olive/50 transition-transform ${shareMenuOpen ? "rotate-180" : ""}`} aria-hidden>▾</span>
                    </button>
                    {shareMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 py-2 rounded-lg bg-background border border-sand-200/80 shadow-lg min-w-[180px] z-10">
                        <button
                          ref={shareMenuFirstItemRef}
                          type="button"
                          onClick={() => {
                            copyShareLink();
                            setShareMenuOpen(false);
                            requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                          }}
                          className="w-full min-h-[44px] px-4 py-2 text-left text-sm font-medium text-olive hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
                        >
                          {linkCopied ? "Link copied" : "Copy link"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            copyItinerary();
                            setShareMenuOpen(false);
                            requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                          }}
                          className="w-full min-h-[44px] px-4 py-2 text-left text-sm font-medium text-olive hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
                        >
                          {copied ? "Copied" : "Copy itinerary (text)"}
                        </button>
                        <div
                          className="px-4 py-2 border-t border-sand-200/80"
                          onClick={() => {
                            setShareMenuOpen(false);
                            requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                          }}
                        >
                          <ShareLinks path={sharePath} text="My Cyprus Winter itinerary —" ariaLabel="Share via" className="flex flex-wrap gap-2" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ListPageHero>
        </header>

        {datesHydrated && withinSevenDays && daysUntil !== null && (
          <div
            role="status"
            className="mb-6 p-4 rounded-xl bg-aegean/10 border border-aegean/20"
          >
            <p className="text-sm font-medium text-olive">
              {daysUntil === 0
                ? "Your trip is today — your Day 1 plan is ready."
                : daysUntil === 1
                  ? "Tomorrow you are here — your Day 1 plan is ready."
                  : `${daysUntil} days until you are here — your Day 1 plan is ready.`}
            </p>
            <p className="text-xs text-olive/70 mt-1">
              {daysUntil === 0 ? "Have a great day." : daysUntil === 1 ? "Have a safe journey." : "Review your itinerary below."}
            </p>
          </div>
        )}

        {datesHydrated && (
          <ListPageWidgetStrip ariaLabel="Trip dates">
            <div className={`${CARD.base} ${CARD.content}`}>
              <p className="text-sm font-medium text-olive mb-2">When are you traveling?</p>
              <div className="flex flex-wrap gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-olive/60">Start</span>
                  <input
                    type="date"
                    value={dates.start ?? ""}
                    onChange={(e) => setTripDates(e.target.value || null, dates.end)}
                    className="min-h-[44px] px-3 py-2 rounded-lg border border-sand-300 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-olive/60">End</span>
                  <input
                    type="date"
                    value={dates.end ?? ""}
                    onChange={(e) => setTripDates(dates.start, e.target.value || null)}
                    className="min-h-[44px] px-3 py-2 rounded-lg border border-sand-300 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                  />
                </label>
              </div>
            </div>
            {dates.start && (
              <PushOptIn tripStartDate={dates.start} variant={withinSevenDays ? "soon" : "far"} />
            )}
          </ListPageWidgetStrip>
        )}

        {hasWineries && hydrated && (
          <div className={`${CARD.base} ${CARD.content} ${CALLOUT.cta} bg-terracotta/5 border-terracotta/30 shadow-sm mb-8 sm:mb-10`}>
            <p className="text-sm font-medium text-olive mb-4">You've added wineries. Book tastings ahead—many run lean in winter.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/bookings" className={CTA.primaryCompact}>
                Book your tastings
              </Link>
              <Link href="/discover?filter=winery" className={CTA.secondaryCompact}>
                Browse wineries
              </Link>
              <Link
                href="/bookings"
                className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-olive/80 font-medium hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                My bookings
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          {/* When hasContent: Day selector first. When empty: Quick start first (order-1) */}
          <div className={hasContent ? "order-1" : "order-2"}>
            <section
            aria-label="Select day"
            className={`mb-8 sm:mb-10 ${
              hasContent
                ? ["sm:sticky sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10", LAYOUT.stickyBarX, "pt-3 pb-4 -mt-3 bg-sand/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sand/90 border-b border-sand-200/80"].join(" ")
                : ""
            }`}
          >
          <div
            role="tablist"
            aria-label="Select day"
            className="flex gap-2 overflow-x-auto scroll-smooth scroll-touch pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none"
            onKeyDown={(e) => {
              const t = e.target as HTMLElement;
              if (t.getAttribute("role") !== "tab") return;
              const next =
                e.key === "ArrowLeft" || e.key === "ArrowUp"
                  ? activeDay <= 1 ? MAX_DAYS : activeDay - 1
                  : e.key === "ArrowRight" || e.key === "ArrowDown"
                    ? activeDay >= MAX_DAYS ? 1 : activeDay + 1
                    : null;
              if (next != null) {
                e.preventDefault();
                setActiveDay(next);
                (e.currentTarget.querySelector(`[data-day="${next}"]`) as HTMLElement)?.focus();
              }
            }}
          >
            {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((d) => {
              const count = (days[d] ?? []).length;
              const isActive = activeDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  data-day={d}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="day-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveDay(d)}
                  className={`shrink-0 snap-start min-w-[4rem] sm:min-w-[5.5rem] px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 min-h-[44px] active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap ${
                    isActive
                      ? "bg-terracotta text-white shadow-md ring-2 ring-terracotta/20"
                      : "bg-white/90 border border-sand-200/80 text-olive/80 hover:border-terracotta/30 hover:bg-sand-100/50 hover:shadow-sm"
                  }`}
                >
                  {count > 0 ? `Day ${d} · ${count}` : `Day ${d}`}
                </button>
              );
            })}
          </div>

          {hasContent && (
            <details className="group mt-4">
              <summary className="list-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-olive/80 hover:text-olive min-h-[44px] py-2 rounded-lg transition-colors duration-200">
                  {activeDaysCount > 1 ? `View all ${activeDaysCount} days` : "View all days"}
                  <span className="text-olive/50 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
                </span>
              </summary>
              <div className="mt-3 space-y-2">
                {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((d) => {
                  const items = days[d] ?? [];
                  const summary = items.map((id) => getPlace(id)?.name ?? "…").join(" → ") || "Add places to get going";
                  const isActive = activeDay === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setActiveDay(d)}
                      className={`w-full min-h-[44px] text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        isActive ? "bg-terracotta/15 text-terracotta font-medium" : "bg-sand-100/80 text-olive/80 hover:bg-sand-200/80"
                      }`}
                    >
                      <span className="font-medium shrink-0">Day {d}</span>
                      <span className="truncate text-olive/70">{summary}</span>
                    </button>
                  );
                })}
              </div>
            </details>
          )}
        </section>
          </div>

          <div className={hasContent ? "order-2" : "order-1"}>
            {/* Quick start */}
            <section ref={quickStartRef} aria-labelledby="quick-start-heading">
          <h2 id="quick-start-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
            Start here
          </h2>
          <p className={`text-sm text-olive/60 max-w-xl break-words ${SECTION.headingGap}`}>
            {hasContent
              ? "Swap templates, add more places, or keep refining. Your plan auto-saves."
              : "Pick a template or add one place. Kourion, Artemis, Omodos—start wherever feels right."}
          </p>

          {/* Popular picks — one-tap add to current day */}
          <div className="mb-6 sm:mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive/50 block mb-2 prose-label">
              Add to Day {activeDay}
            </span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[
                { id: "artemis", label: "Artemis Trail" },
                { id: "kourion", label: "Kourion" },
                { id: "domes-sergiou", label: "Dómes Sergiou" },
                { id: "omodos", label: "Omodos" },
              ].map(({ id, label }) => {
                const inDay = (days[activeDay] ?? []).includes(id);
                const place = getPlace(id);
                if (!place) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => addToDay(id)}
                    disabled={inDay}
                    className={`${PILL.base} rounded-xl disabled:active:scale-100 ${
                      inDay
                        ? "bg-sand-200/80 text-olive/50 cursor-default"
                        : "bg-sand-200/80 text-olive hover:bg-terracotta/10 hover:text-terracotta border border-sand-200/80 hover:border-terracotta/30"
                    }`}
                    aria-pressed={inDay}
                    aria-label={inDay ? `${label} added` : `Add ${label} to Day ${activeDay}`}
                  >
                    {inDay ? "✓ " : ""}{label}
                  </button>
                );
              })}
              <Link
                href="/discover?filter=winery"
                className={`shrink-0 rounded-xl ${CTA.secondaryCompact} active:scale-[0.98] motion-reduce:active:scale-100`}
              >
                Browse wineries
              </Link>
              <Link
                href="/events"
                className={`shrink-0 rounded-xl ${CTA.secondaryCompact} active:scale-[0.98] motion-reduce:active:scale-100`}
              >
                What&apos;s on
              </Link>
            </div>
          </div>

          {/* Pre-built itineraries */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-olive/50 block mb-2 prose-label">
              Pre-built itineraries
            </span>
            <div className="flex gap-3 overflow-x-auto scroll-smooth scroll-touch pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible scrollbar-none snap-x snap-mandatory">
              {TEMPLATES.map(({ key, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTemplateClick(key)}
                  className={`shrink-0 snap-start w-[min(180px,70vw)] sm:w-auto text-left min-h-[60px] ${CARD.content} ${CARD.base} ${CARD.hover} active:scale-[0.99] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background group`}
                >
                  <span className="font-display font-semibold text-olive block break-words group-hover:text-terracotta transition-colors">{label}</span>
                  <span className="text-xs text-olive/60 mt-0.5 block break-words">{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
          </div>
        </div>

        {/* Day content — itinerary panel */}
        <section aria-label="Your itinerary" className="space-y-6">
          <div id="day-panel" role="tabpanel" aria-live="polite" aria-atomic="false" className="space-y-6 sm:space-y-8">
            {/* Day content */}
            <div className={`${CARD.base} overflow-hidden`}>
              <div className="px-5 sm:px-6 py-4 border-b border-sand-200/80 bg-sand-100/50 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-olive">
                    Day {activeDay}
                    {activeItems.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-olive/60">
                        — {activeItems.length} {activeItems.length === 1 ? "place" : "places"}
                      </span>
                    )}
                  </h3>
                  {activeItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClearModal(true)}
                    className="min-h-[44px] inline-flex items-center px-3 py-2 text-sm font-medium text-olive/60 hover:text-terracotta rounded-lg hover:bg-terracotta/5 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`Clear all places from Day ${activeDay}`}
                  >
                    Clear day
                  </button>
                )}
                </div>
                {activeItems.length >= 3 && (
                  <p className="text-sm text-terracotta font-medium" role="status">
                    Day {activeDay} is full. Add your next stop below.
                  </p>
                )}
              </div>

              <div className={CARD.content}>
                {activeItems.length === 0 ? (
                  <div className={`${EMPTY_STATE_DASHED} bg-sand-100/30 transition-colors duration-200`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sand-200/80 flex items-center justify-center text-2xl text-olive/40" aria-hidden>
                      +
                    </div>
                    <p className="font-display font-semibold text-olive mb-1">Add your first place</p>
                    <p className="text-sm text-olive/60 max-w-sm mx-auto break-words mb-6">
                      Start with a beach—Nissi is a crowd favourite. Or add Artemis, Kourion, Omodos. Ask AI for more ideas.
                    </p>
                    <button
                      type="button"
                      onClick={() => quickStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className={CTA.primaryCompact}
                    >
                      Add your first place
                    </button>
                  </div>
                ) : (
                  (() => {
                    const useBlocks = activeItems.length >= 3;
                    const mid = Math.ceil(activeItems.length / 2);
                    const morningIds = useBlocks ? activeItems.slice(0, mid) : activeItems;
                    const afternoonIds = useBlocks ? activeItems.slice(mid) : [];

                    function TimelineRow({
                      id,
                      index,
                      showConnector,
                    }: {
                      id: string;
                      index: number;
                      showConnector: boolean;
                    }) {
                      const p = getPlace(id);
                      if (!p) {
                        return (
                          <div key={id} className="flex gap-4">
                            <div className="flex flex-col items-center shrink-0">
                              <span className="w-8 h-8 rounded-full bg-sand-200/80 text-olive/50 flex items-center justify-center text-sm font-semibold">
                                {index}
                              </span>
                              {showConnector && <span className="w-0.5 h-6 bg-sand-200/80 mt-2 shrink-0" aria-hidden />}
                            </div>
                            <div className={`flex-1 flex items-center justify-between ${CARD.content} rounded-xl border border-sand-200/80 bg-sand-100/50`}>
                              <span className="text-sm text-olive/60 italic">This place was removed from our list</span>
                              <button
                                type="button"
                                onClick={() => removeFromDay(id)}
                                className="min-h-[44px] px-3 py-2 text-sm font-medium text-olive/70 hover:text-terracotta rounded-lg hover:bg-terracotta/5 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                aria-label="Remove"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={id} className="flex gap-4">
                          <div className="flex flex-col items-center shrink-0">
                            <span
                              ref={lastAddedId === id ? lastAddedCardRef : undefined}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                                lastAddedId === id
                                  ? "bg-terracotta text-white ring-2 ring-terracotta/40 ring-offset-2 ring-offset-white"
                                  : "bg-sand-200/80 text-olive/70"
                              }`}
                            >
                              {index}
                            </span>
                            {showConnector && <span className="w-0.5 h-6 bg-sand-200/80 mt-2 shrink-0" aria-hidden />}
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <ItineraryCard
                              place={p}
                              onRemove={() => removeFromDay(id)}
                              lastAdded={lastAddedId === id}
                              index={index}
                              cardRef={undefined}
                              inTimeline
                            />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-0">
                        {useBlocks ? (
                          <>
                            <div className="mb-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-olive/50">Morning</span>
                            </div>
                            <div className="space-y-0">
                              {morningIds.map((id, i) => (
                                <TimelineRow
                                  key={id}
                                  id={id}
                                  index={i + 1}
                                  showConnector={i < morningIds.length - 1 || afternoonIds.length > 0}
                                />
                              ))}
                            </div>
                            {afternoonIds.length > 0 && (
                              <>
                                <div className="mt-6 mb-3">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-olive/50">Afternoon</span>
                                </div>
                                <div className="space-y-0">
                                  {afternoonIds.map((id, i) => (
                                    <TimelineRow
                                      key={id}
                                      id={id}
                                      index={mid + i + 1}
                                      showConnector={i < afternoonIds.length - 1}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="space-y-0">
                            {activeItems.map((id, i) => (
                              <TimelineRow
                                key={id}
                                id={id}
                                index={i + 1}
                                showConnector={i < activeItems.length - 1}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            <div id="plan-add-sentinel" aria-hidden className="h-0" />
            {/* Inline Add next stop — chips + Browse all */}
            <div
              id="plan-inline-add"
              className={`${CARD.base} overflow-hidden`}
            >
              <div className={`${CARD.content} pt-4`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-olive/50 block mb-3 prose-label">
                  Add next stop
                </span>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { id: "artemis", label: "Artemis Trail" },
                    { id: "kourion", label: "Kourion" },
                    { id: "domes-sergiou", label: "Dómes Sergiou" },
                    { id: "omodos", label: "Omodos" },
                  ].map(({ id, label }) => {
                    const inDay = (days[activeDay] ?? []).includes(id);
                    const place = getPlace(id);
                    if (!place) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => addToDay(id)}
                        disabled={inDay}
                        className={`${PILL.base} rounded-xl disabled:active:scale-100 ${
                          inDay
                            ? "bg-sand-200/80 text-olive/50 cursor-default"
                            : "bg-sand-200/80 text-olive hover:bg-terracotta/10 hover:text-terracotta border border-sand-200/80 hover:border-terracotta/30"
                        }`}
                        aria-pressed={inDay}
                        aria-label={inDay ? `${label} added` : `Add ${label} to Day ${activeDay}`}
                      >
                        {inDay ? "✓ " : ""}{label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setShowBrowseModal(true)}
                    className={`shrink-0 rounded-xl ${CTA.secondaryCompact} active:scale-[0.98] motion-reduce:active:scale-100`}
                  >
                    Browse all
                  </button>
                </div>
                {activeItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-sand-200/80">
                    <SuggestedForDay activeDayItems={activeItems} onAdd={addToDay} embedded />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <p className="mt-12 text-center text-olive/60 text-sm break-words px-4">
          Daylight ends around 5pm. Start early, save when you&apos;re ready.
        </p>

        {showClearModal && (
          <ClearDayModal
            activeDay={activeDay}
            placeCount={activeItems.length}
            onClose={() => setShowClearModal(false)}
            onConfirm={() => {
              clearDay();
              setShowClearModal(false);
            }}
          />
        )}

        <PlanStickyAddBar
          sentinelId="plan-add-sentinel"
          scrollTargetId="plan-inline-add"
          onAddPlaceClick={() => setShowBrowseModal(true)}
        />

        {showBrowseModal && (
          <PlacePickerModal
            activeDayItems={activeItems}
            onAdd={addToDay}
            onClose={() => setShowBrowseModal(false)}
          />
        )}

        {templateChoice && hasContent && (
          <TemplateChoiceModal
            onClose={() => setTemplateChoice(null)}
            onAddToPlan={handleAddTemplate}
            onReplace={handleReplaceTemplate}
          />
        )}
      </div>
    </div>
  );
}

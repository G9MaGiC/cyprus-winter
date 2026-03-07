"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ListPageHero from "@/components/ListPageHero";
import ItineraryCard from "@/components/ItineraryCard";
import ClearDayModal from "@/components/plan/ClearDayModal";
import PlanStickyAddBar from "@/components/plan/PlanStickyAddBar";
import TemplateChoiceModal from "@/components/plan/TemplateChoiceModal";
import PlacePicker from "@/components/PlacePicker";
import SuggestedForDay from "@/components/SuggestedForDay";
import ShareLinks from "@/components/ShareLinks";
import { useSearchParams, useRouter } from "next/navigation";
import { LAYOUT, SECTION, CARD, CTA, EMPTY_STATE_DASHED } from "@/lib/design-tokens";
import { useItinerary } from "@/hooks/useItinerary";

const TEMPLATES = [
  { key: "classic" as const, label: "Classic", sub: "Coast, culture, villages" },
  { key: "mountain" as const, label: "Mountain", sub: "Trails & Troodos" },
  { key: "coast-culture" as const, label: "Coast & Culture", sub: "Beaches, ruins, wine" },
  { key: "family" as const, label: "Family", sub: "2–3 activities/day, gentle pace" },
  { key: "short-stay" as const, label: "Short stay", sub: "48 hours: trail, village, wine" },
];

export default function PlanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showClearModal, setShowClearModal] = useState(false);
  const [templateChoice, setTemplateChoice] = useState<string | null>(null);
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
    if (!addId || processedAddRef.current === addId) return;
    processedAddRef.current = addId;
    const place = getPlace(addId);
    if (!place) {
      router.replace("/plan", { scroll: false });
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
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} ${SECTION.blockGap}`}>
        {copied && (
          <div className="sr-only" role="status" aria-live="polite">
            Itinerary copied to clipboard
          </div>
        )}

        {searchParams.get("add") && !hydrated && (
          <p className="text-sm text-olive/70 mb-4" role="status" aria-live="polite">
            Adding to your plan…
          </p>
        )}

        <header role="banner">
          <ListPageHero
            backHref="/"
            backLabel="Home"
            title="Plan your Cyprus winter trip"
            description="Pick a template or add places one by one. Your plan saves as you go."
          >
            <div
              className={`mt-6 sm:mt-8 ${CARD.contentLg} ${
                hasContent ? `${CARD.base}` : "border-0 shadow-none bg-transparent"
              }`}
            >
              {hasContent && hydrated && (
                <div className="shrink-0 mb-4" aria-live="polite" role="status">
                  <div className="flex items-center gap-5 mb-2">
                    <span>
                      <span className="text-xl sm:text-2xl font-display font-bold text-terracotta tabular-nums">
                        {totalPlaces}
                      </span>
                      <span className="text-xs text-olive/60 ml-1">places</span>
                    </span>
                    <span>
                      <span className="text-xl sm:text-2xl font-display font-bold text-aegean tabular-nums">
                        {activeDaysCount}
                      </span>
                      <span className="text-xs text-olive/60 ml-1">
                        of 5 days planned
                      </span>
                    </span>
                    <span className="text-xs text-sage font-medium">Auto-saved</span>
                  </div>
                  <div
                    className="h-1.5 w-full max-w-xs rounded-full bg-sand-200/80 overflow-hidden flex"
                    aria-hidden
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <div
                        key={d}
                        className={`flex-1 ${d <= activeDaysCount ? "bg-aegean" : "bg-transparent"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-olive/50 mt-1">
                    Your trip: {activeDaysCount}/5 days with activities
                  </p>
                </div>
              )}

              {hasContent && (
              <nav
                aria-label="Plan steps"
                className="mt-6 sm:mt-8 pt-6 border-t border-sand-200/80"
              >
                <ol className="flex items-center gap-3 sm:gap-6">
                  {[
                    { label: "Choose a starting point", done: true },
                    { label: "Add places", done: true },
                    { label: "Copy & share", done: copied },
                  ].map(({ label, done }, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 min-w-0"
                      aria-current={i === 2 && !copied ? "step" : undefined}
                    >
                      <span
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          done ? "bg-terracotta text-white" : "bg-sand-200/80 text-olive/40"
                        }`}
                        aria-hidden
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span
                        className={`text-xs truncate hidden sm:inline ${done ? "text-olive/80" : "text-olive/40"}`}
                      >
                        {label}
                      </span>
                      {i < 2 && (
                        <span
                          className="hidden sm:block shrink-0 w-6 h-0.5 rounded bg-terracotta/40"
                          aria-hidden
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {hasContent ? (
              <div className="mt-6 sm:mt-8 pt-6 border-t border-sand-200/80 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={copyItinerary}
                  className={`${CTA.primaryCompact} shadow-sm hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100`}
                  aria-label="Copy itinerary to clipboard"
                >
                  {copied ? "Copied" : "Copy itinerary"}
                </button>
                <ShareLinks
                  path={sharePath}
                  text="My Cyprus Winter itinerary —"
                  ariaLabel="Share via"
                  className="inline-flex"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => quickStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={`mt-6 ${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100`}
              >
                Pick a template or add your first place
              </button>
            )}
            </div>
          </ListPageHero>
        </header>

        {hasWineries && hydrated && (
          <div className={`${CARD.base} p-5 sm:p-6 bg-terracotta/5 border-terracotta/20 mb-8 sm:mb-10`}>
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
                ? ["sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10", LAYOUT.stickyBarX, "pt-3 pb-4 -mt-3 bg-sand/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sand/90 border-b border-sand-200/80"].join(" ")
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
                  ? activeDay <= 1 ? 5 : activeDay - 1
                  : e.key === "ArrowRight" || e.key === "ArrowDown"
                    ? activeDay >= 5 ? 1 : activeDay + 1
                    : null;
              if (next != null) {
                e.preventDefault();
                setActiveDay(next);
                (e.currentTarget.querySelector(`[data-day="${next}"]`) as HTMLElement)?.focus();
              }
            }}
          >
            {[1, 2, 3, 4, 5].map((d) => {
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
                  className={`shrink-0 snap-start min-w-[3.5rem] sm:min-w-[4.5rem] px-3 sm:px-4 py-3 rounded-xl font-semibold transition-all duration-200 min-h-[48px] active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive
                      ? "bg-terracotta text-white shadow-md ring-2 ring-terracotta/20"
                      : "bg-white/90 border border-sand-200/80 text-olive/80 hover:border-terracotta/30 hover:bg-sand-100/50 hover:shadow-sm"
                  }`}
                >
                  <span className="sm:hidden">{d}</span>
                  <span className="hidden sm:inline">Day {d}</span>
                  {count > 0 && (
                    <span className={`block text-xs font-normal mt-0.5 ${isActive ? "text-white/90" : "text-olive/60"}`}>
                      {count} {count === 1 ? "place" : "places"}
                    </span>
                  )}
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
                {[1, 2, 3, 4, 5].map((d) => {
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
          <h2 id="quick-start-heading" className={`font-display text-lg font-semibold text-olive ${SECTION.titleGap}`}>
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
                    className={`inline-flex items-center shrink-0 min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:active:scale-100 ${
                      inDay
                        ? "bg-sand-200/80 text-olive/50 cursor-default"
                        : "bg-sand-200/80 text-olive hover:bg-terracotta/20 hover:text-terracotta"
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
            <div className="grid sm:grid-cols-3 gap-4">
              {TEMPLATES.map(({ key, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTemplateClick(key)}
                  className={`text-left min-h-[60px] ${CARD.content} ${CARD.base} ${CARD.hover} active:scale-[0.99] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background group`}
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
                        <p className="mt-4 text-xs text-olive/50 flex items-center gap-2">
                          <span className="text-terracotta">+</span> Add next stop below
                        </p>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            <div id="plan-add-sentinel" aria-hidden className="h-0" />
            {/* Add places — Pair with (suggestions), collapsible */}
            <details
              id="plan-add-places"
              open={activeItems.length > 0}
              className={`${CARD.base} overflow-hidden group`}
            >
              <summary className="list-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-t-xl">
                <h3 className="font-display font-semibold text-olive py-4 px-5 sm:px-6 flex items-center gap-2 min-h-[44px] [&::-webkit-details-marker]:hidden">
                  <span className="w-6 h-6 rounded-full bg-aegean/20 text-aegean flex items-center justify-center text-xs font-bold shrink-0" aria-hidden>◇</span>
                  Pair with…
                  <span className="text-olive/50 ml-auto transition-transform group-open:rotate-180" aria-hidden>▾</span>
                </h3>
              </summary>
              <div className={`${CARD.content} pt-0 border-t border-sand-200/80`}>
                <SuggestedForDay activeDayItems={activeItems} onAdd={addToDay} embedded />
              </div>
            </details>

            {/* Add places — Browse all, collapsible */}
            <details
              open={activeItems.length === 0}
              className={`${CARD.base} overflow-hidden group`}
            >
              <summary className="list-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-t-xl">
                <h3 className="font-display font-semibold text-olive py-4 px-5 sm:px-6 flex items-center gap-2 min-h-[44px] [&::-webkit-details-marker]:hidden">
                  <span className="w-6 h-6 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center text-xs font-bold shrink-0" aria-hidden>+</span>
                  Browse all places
                  <span className="text-olive/50 ml-auto transition-transform group-open:rotate-180" aria-hidden>▾</span>
                </h3>
              </summary>
              <div className={`${CARD.content} pt-0 border-t border-sand-200/80`}>
                <PlacePicker activeDayItems={activeItems} onAdd={addToDay} />
              </div>
            </details>
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

        <PlanStickyAddBar sentinelId="plan-add-sentinel" scrollTargetId="plan-add-places" />

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

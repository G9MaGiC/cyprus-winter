"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useItinerary, MAX_DAYS } from "@/hooks/useItinerary";
import { usePlanUrlActions } from "@/hooks/usePlanUrlActions";
import { useTripDates } from "@/hooks/useTripDates";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { TemplateKey } from "@/data/itinerary-templates";

export type ComboChoice = { label: string; ids: string[] };

export function usePlanPage() {
  const online = useOnlineStatus();
  const planReadOnly = !online;

  const [showClearModal, setShowClearModal] = useState(false);
  const [templateChoice, setTemplateChoice] = useState<string | null>(null);
  const [comboChoice, setComboChoice] = useState<ComboChoice | null>(null);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [templateAppliedFromUrl, setTemplateAppliedFromUrl] = useState<TemplateKey | null>(null);

  const { dates, setTripDates, hydrated: datesHydrated, daysUntil, withinSevenDays, tripLength } =
    useTripDates();
  const {
    days,
    activeDay,
    setActiveDay,
    hydrated,
    copied,
    addToDayIfMissing,
    removeFromDay,
    getPlace,
    lastAddedId,
    hasContent,
    hasWineries,
    hasTrails,
    applyTemplate,
    mergeTemplate,
    clearDay,
    copyItinerary,
    copyShareLink,
    linkCopied,
    icsDownloaded,
    downloadCalendar,
    sharePath,
    sharePreviewLine,
    shareText,
  } = useItinerary();

  const activeItems = days[activeDay] ?? [];
  const totalPlaces = Object.values(days).flat().length;
  const activeDaysCount = Object.keys(days).filter(
    (d) => (days[Number(d)] ?? []).length > 0
  ).length;
  const displayDaysCount = tripLength ?? (hasContent ? MAX_DAYS : 1);
  const lastAddedCardRef = useRef<HTMLDivElement | null>(null);
  const quickStartRef = useRef<HTMLDivElement | null>(null);

  usePlanUrlActions({
    hydrated,
    hasContent,
    getPlace,
    addToDayIfMissing,
    applyTemplate,
    onTemplateApplied: setTemplateAppliedFromUrl,
    mutationsDisabled: planReadOnly,
  });

  const scrollBehavior = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    []
  );

  useEffect(() => {
    if (lastAddedId && lastAddedCardRef.current) {
      lastAddedCardRef.current.scrollIntoView({
        behavior: scrollBehavior(),
        block: "nearest",
      });
    }
  }, [lastAddedId, scrollBehavior]);

  useEffect(() => {
    if (activeDay > displayDaysCount) {
      setActiveDay(displayDaysCount);
    }
  }, [activeDay, displayDaysCount, setActiveDay]);

  const handleTemplateClick = useCallback(
    (key: string) => {
      if (planReadOnly) return;
      if (!hasContent) {
        applyTemplate(key as TemplateKey);
        return;
      }
      setTemplateChoice(key);
    },
    [planReadOnly, hasContent, applyTemplate]
  );

  const handleReplaceTemplate = useCallback(() => {
    if (planReadOnly || !templateChoice) return;
    applyTemplate(templateChoice as TemplateKey);
    setTemplateChoice(null);
  }, [planReadOnly, templateChoice, applyTemplate]);

  const handleAddTemplate = useCallback(() => {
    if (planReadOnly || !templateChoice) return;
    mergeTemplate(templateChoice as TemplateKey);
    setTemplateChoice(null);
  }, [planReadOnly, templateChoice, mergeTemplate]);

  const handleComboClick = useCallback(
    (ids: string[], label: string) => {
      if (planReadOnly) return;
      if (!hasContent) {
        for (const id of ids) addToDayIfMissing(id);
        return;
      }
      setComboChoice({ label, ids });
    },
    [planReadOnly, hasContent, addToDayIfMissing]
  );

  const handleAddCombo = useCallback(() => {
    if (planReadOnly || !comboChoice) return;
    for (const id of comboChoice.ids) addToDayIfMissing(id);
    setComboChoice(null);
  }, [planReadOnly, comboChoice, addToDayIfMissing]);

  const handleReplaceCombo = useCallback(() => {
    if (planReadOnly || !comboChoice) return;
    clearDay();
    for (const id of comboChoice.ids) addToDayIfMissing(id);
    setComboChoice(null);
  }, [planReadOnly, comboChoice, clearDay, addToDayIfMissing]);

  const handleClearDayConfirm = useCallback(() => {
    if (planReadOnly) return;
    clearDay();
    setShowClearModal(false);
  }, [planReadOnly, clearDay]);

  const guardedAddToDay = useCallback(
    (id: string) => {
      if (planReadOnly) return;
      addToDayIfMissing(id);
    },
    [planReadOnly, addToDayIfMissing]
  );

  const guardedRemoveFromDay = useCallback(
    (id: string) => {
      if (planReadOnly) return;
      removeFromDay(id);
    },
    [planReadOnly, removeFromDay]
  );

  const scrollToQuickStart = useCallback(() => {
    quickStartRef.current?.scrollIntoView({
      behavior: scrollBehavior(),
      block: "start",
    });
  }, [scrollBehavior]);

  return {
    // Modal state
    showClearModal,
    setShowClearModal,
    templateChoice,
    setTemplateChoice,
    comboChoice,
    setComboChoice,
    showBrowseModal,
    setShowBrowseModal,
    // Trip dates
    dates,
    setTripDates,
    datesHydrated,
    daysUntil,
    withinSevenDays,
    tripLength,
    // Itinerary
    days,
    activeDay,
    setActiveDay,
    activeItems,
    hydrated,
    copied,
    planReadOnly,
    addToDayIfMissing: guardedAddToDay,
    removeFromDay: guardedRemoveFromDay,
    getPlace,
    lastAddedId,
    hasContent,
    hasWineries,
    hasTrails,
    clearDay,
    copyItinerary,
    copyShareLink,
    linkCopied,
    icsDownloaded,
    downloadCalendar,
    sharePath,
    sharePreviewLine,
    shareText,
    templateAppliedFromUrl,
    // Derived
    totalPlaces,
    activeDaysCount,
    displayDaysCount,
    // Refs
    lastAddedCardRef,
    quickStartRef,
    // Handlers
    handleTemplateClick,
    handleReplaceTemplate,
    handleAddTemplate,
    handleComboClick,
    handleAddCombo,
    handleReplaceCombo,
    handleClearDayConfirm,
    scrollToQuickStart,
  };
}

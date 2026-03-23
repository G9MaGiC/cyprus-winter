"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useItinerary, MAX_DAYS } from "@/hooks/useItinerary";
import { usePlanUrlActions } from "@/hooks/usePlanUrlActions";
import { useTripDates } from "@/hooks/useTripDates";
import { useToastContext } from "@/contexts/ToastContext";
import { useTranslations } from "next-intl";
import type { TemplateKey } from "@/data/itinerary-templates";
import { ITINERARY_TEMPLATES } from "@/data/itinerary-templates";

export type ComboChoice = { label: string; ids: string[] };

const TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  ITINERARY_TEMPLATES.map((t) => [t.key, t.label])
);

export function usePlanPage() {
  const toast = useToastContext();
  const tPlan = useTranslations("plan");
  const [showClearModal, setShowClearModal] = useState(false);
  const [templateChoice, setTemplateChoice] = useState<string | null>(null);
  const [comboChoice, setComboChoice] = useState<ComboChoice | null>(null);
  const [showBrowseModal, setShowBrowseModal] = useState(false);

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
  const activeDaysCount = Object.keys(days).filter(
    (d) => (days[Number(d)] ?? []).length > 0
  ).length;
  const displayDaysCount = tripLength ?? (hasContent ? MAX_DAYS : 1);
  const lastAddedCardRef = useRef<HTMLDivElement | null>(null);
  const quickStartRef = useRef<HTMLDivElement | null>(null);

  usePlanUrlActions({ hydrated, hasContent, getPlace, addToDayIfMissing, applyTemplate });

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
      if (!hasContent) {
        applyTemplate(key as TemplateKey);
        return;
      }
      setTemplateChoice(key);
    },
    [hasContent, applyTemplate]
  );

  const handleReplaceTemplate = useCallback(() => {
    if (!templateChoice) return;
    applyTemplate(templateChoice as TemplateKey, true);
    toast.success(tPlan("toast.templateReplaced", { label: TEMPLATE_LABELS[templateChoice] ?? templateChoice }));
    setTemplateChoice(null);
  }, [templateChoice, applyTemplate, toast, tPlan]);

  const handleAddTemplate = useCallback(() => {
    if (!templateChoice) return;
    mergeTemplate(templateChoice as TemplateKey);
    toast.success(tPlan("toast.templateAdded", { label: TEMPLATE_LABELS[templateChoice] ?? templateChoice }));
    setTemplateChoice(null);
  }, [templateChoice, mergeTemplate, toast, tPlan]);

  const handleComboClick = useCallback(
    (ids: string[], label: string) => {
      if (!hasContent) {
        for (const id of ids) addToDayIfMissing(id);
        return;
      }
      setComboChoice({ label, ids });
    },
    [hasContent, addToDayIfMissing]
  );

  const handleAddCombo = useCallback(() => {
    if (!comboChoice) return;
    for (const id of comboChoice.ids) addToDayIfMissing(id);
    toast.success(tPlan("toast.comboAdded", { label: comboChoice.label }));
    setComboChoice(null);
  }, [comboChoice, addToDayIfMissing, toast, tPlan]);

  const handleReplaceCombo = useCallback(() => {
    if (!comboChoice) return;
    clearDay();
    for (const id of comboChoice.ids) addToDayIfMissing(id);
    toast.success(tPlan("toast.comboReplaced", { label: comboChoice.label }));
    setComboChoice(null);
  }, [comboChoice, clearDay, addToDayIfMissing, toast, tPlan]);

  const handleClearDayConfirm = useCallback(() => {
    clearDay();
    setShowClearModal(false);
  }, [clearDay]);

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
    addToDayIfMissing,
    removeFromDay,
    getPlace,
    lastAddedId,
    hasContent,
    hasWineries,
    clearDay,
    copyItinerary,
    copyShareLink,
    linkCopied,
    sharePath,
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

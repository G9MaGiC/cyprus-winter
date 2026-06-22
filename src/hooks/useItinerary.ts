"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getPlaceById, type PlanItem } from "@/data";
import { buildPlanSharePath, MAX_DAYS } from "@/lib/itinerary-share";
import { buildPlanIcs, downloadPlanIcs } from "@/lib/plan-ics";
import { toAbsoluteUrl } from "@/lib/site-url";
import { getTemplateDays, ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import { trackProduct } from "@/lib/analytics";
import {
  emptyDays,
  loadItineraryFromStorage,
  loadItineraryFromUrl,
  persistItineraryToStorage,
  getItineraryStorageKey,
} from "@/lib/itinerary-storage";

const STORAGE_KEY = getItineraryStorageKey();
type AddToDayOptions = { mergeStored?: boolean };

export { MAX_DAYS };
export { ITINERARY_TEMPLATES, type TemplateKey };

/** @deprecated Use getTemplateDays or ITINERARY_TEMPLATES */
export const WINTER_TEMPLATES: Record<string, Record<number, string[]>> = Object.fromEntries(
  ITINERARY_TEMPLATES.map((t) => [t.key, t.days])
);

export function useItinerary() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const tPlanClip = useTranslations("plan.clipboard");
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isMountedRef = useRef(true);
  const daysRef = useRef<Record<number, string[]>>(emptyDays());
  const [days, setDays] = useState<Record<number, string[]>>(emptyDays);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const [activeDay, setActiveDay] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [icsDownloaded, setIcsDownloaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const fromUrl = loadItineraryFromUrl(searchParams);
      const fromStorage = loadItineraryFromStorage();
      // URL param wins (shared link); otherwise use localStorage
      setDays(fromUrl ?? fromStorage);
      setHydrated(true);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!hydrated) return;
    persistItineraryToStorage(days);
  }, [days, hydrated]);

  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue != null && isMountedRef.current) {
        try {
          const parsed = JSON.parse(e.newValue) as Record<string, string[]>;
          const out = emptyDays();
          for (const [k, v] of Object.entries(parsed)) {
            const d = parseInt(k, 10);
            if (d >= 1 && d <= MAX_DAYS && Array.isArray(v)) out[d] = v;
          }
          setDays(out);
        } catch {
          // ignore parse errors from other tabs
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const setLastAdded = useCallback((id: string) => {
    setLastAddedId(id);
    const t = setTimeout(() => setLastAddedId(null), 600);
    timeoutRefs.current.push(t);
  }, []);

  const toggleInDay = useCallback((id: string) => {
    const current = daysRef.current[activeDay] ?? [];
    const isAdding = !current.includes(id);
    setDays((prev) => {
      const prevCurrent = prev[activeDay] ?? [];
      const shouldAdd = !prevCurrent.includes(id);
      const nextDay = shouldAdd ? [...prevCurrent, id] : prevCurrent.filter((x) => x !== id);
      return { ...prev, [activeDay]: nextDay };
    });
    if (isAdding) setLastAdded(id);
  }, [activeDay, setLastAdded]);

  const addToDayIfMissing = useCallback((id: string, options?: AddToDayOptions) => {
    const current = daysRef.current[activeDay] ?? [];
    if (current.includes(id) && !options?.mergeStored) return;
    setDays((prev) => {
      const base = options?.mergeStored
        ? (() => {
            const stored = loadItineraryFromStorage();
            const merged = emptyDays();
            for (let d = 1; d <= MAX_DAYS; d++) {
              merged[d] = [...new Set([...(stored[d] ?? []), ...(prev[d] ?? [])])];
            }
            return merged;
          })()
        : prev;
      const prevCurrent = base[activeDay] ?? [];
      if (prevCurrent.includes(id)) return base;
      return { ...base, [activeDay]: [...prevCurrent, id] };
    });
    setLastAdded(id);
  }, [activeDay, setLastAdded]);

  const removeFromDay = useCallback((id: string) => {
    setDays((prev) => ({
      ...prev,
      [activeDay]: (prev[activeDay] ?? []).filter((x) => x !== id),
    }));
    trackProduct("plan_remove", { item_id: id, locale });
  }, [activeDay, locale]);

  const getPlace = useCallback((id: string): PlanItem | undefined => {
    return getPlaceById(id);
  }, []);

  const hasContent = Object.values(days).some((ids) => ids.length > 0);
  const hasWineries = Object.values(days).some((ids) =>
    ids.some((id) => getPlace(id)?.type === "winery")
  );

  const applyTemplate = useCallback((key: TemplateKey, mode: "replace" | "merge" = "replace") => {
    const template = getTemplateDays(key);
    if (!template) return;
    const validId = (id: string) => (getPlaceById(id) ? id : null);
    setDays((prev) => {
      const next = emptyDays();
      for (let d = 1; d <= MAX_DAYS; d++) {
        const existing = (prev[d] ?? []).map(validId).filter(Boolean) as string[];
        const fromTemplate = (template[d] ?? []).map(validId).filter(Boolean) as string[];
        next[d] = mode === "merge"
          ? [...new Set([...existing, ...fromTemplate])]
          : [...fromTemplate];
      }
      return next;
    });
    trackProduct("plan_template_apply", { template: key, mode, locale });
  }, [locale]);

  const applyTemplateReplace = useCallback((key: TemplateKey) => {
    applyTemplate(key, "replace");
  }, [applyTemplate]);

  const mergeTemplate = useCallback((key: TemplateKey) => {
    applyTemplate(key, "merge");
  }, [applyTemplate]);

  const clearDay = useCallback(() => {
    setDays((prev) => ({ ...prev, [activeDay]: [] }));
  }, [activeDay]);

  const copyItinerary = useCallback(async () => {
    const lines: string[] = [tPlanClip("heading"), ""];
    for (let d = 1; d <= MAX_DAYS; d++) {
      const items = days[d] ?? [];
      if (items.length === 0) continue;
      lines.push(tPlanClip("dayLabel", { day: d }));
      for (const id of items) {
        const p = getPlace(id);
        if (p) lines.push(`  • ${p.name} (${p.region})`);
      }
      lines.push("");
    }
    const text = lines.join("\n").trim() || tPlanClip("emptyFallback");
    try {
      await navigator.clipboard.writeText(text);
      if (!isMountedRef.current) return;
      setCopied(true);
      const itemCount = Object.values(days).flat().length;
      const dayCount = Object.values(days).filter((v) => v.length > 0).length;
      trackProduct("plan_share", { share_method: "copy_text", item_count: itemCount, day_count: dayCount, locale });
      const t = setTimeout(() => {
        if (isMountedRef.current) setCopied(false);
      }, 2000);
      timeoutRefs.current.push(t);
    } catch {
      // clipboard not available
    }
  }, [days, getPlace, locale, tPlanClip]);

  const sharePath = hasContent ? buildPlanSharePath(days) : "/plan";

  const downloadCalendar = useCallback(() => {
    const ics = buildPlanIcs(days, getPlace);
    downloadPlanIcs(ics);
    if (!isMountedRef.current) return;
    setIcsDownloaded(true);
    const itemCount = Object.values(days).flat().length;
    const dayCount = Object.values(days).filter((v) => v.length > 0).length;
    trackProduct("plan_share", { share_method: "download_ics", item_count: itemCount, day_count: dayCount, locale });
    const t = setTimeout(() => {
      if (isMountedRef.current) setIcsDownloaded(false);
    }, 2000);
    timeoutRefs.current.push(t);
  }, [days, getPlace, locale]);

  const copyShareLink = useCallback(async () => {
    const url = toAbsoluteUrl(sharePath);
    try {
      await navigator.clipboard.writeText(url);
      if (!isMountedRef.current) return;
      setLinkCopied(true);
      const itemCount = Object.values(days).flat().length;
      const dayCount = Object.values(days).filter((v) => v.length > 0).length;
      trackProduct("plan_share", { share_method: "copy_link", item_count: itemCount, day_count: dayCount, locale });
      const t = setTimeout(() => {
        if (isMountedRef.current) setLinkCopied(false);
      }, 2000);
      timeoutRefs.current.push(t);
    } catch {
      // clipboard not available
    }
  }, [sharePath, days, locale]);

  useEffect(() => {
    return () => {
      for (const t of timeoutRefs.current) clearTimeout(t);
      timeoutRefs.current = [];
    };
  }, []);

  return {
    days,
    lastAddedId,
    activeDay,
    setActiveDay,
    hydrated,
    copied,
    linkCopied,
    icsDownloaded,
    downloadCalendar,
    copyShareLink,
    toggleInDay,
    addToDayIfMissing,
    removeFromDay,
    getPlace,
    hasContent,
    hasWineries,
    applyTemplate: applyTemplateReplace,
    mergeTemplate,
    clearDay,
    copyItinerary,
    sharePath,
  };
}

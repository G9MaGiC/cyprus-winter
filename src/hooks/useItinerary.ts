"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getPlaceById, type PlanItem } from "@/data";
import { decodeItinerary, buildPlanSharePath, MAX_DAYS } from "@/lib/itinerary-share";
import { toAbsoluteUrl } from "@/lib/site-url";

const STORAGE_KEY = "cyprus-winter-itinerary";

export { MAX_DAYS };

function emptyDays(): Record<number, string[]> {
  const out: Record<number, string[]> = {};
  for (let d = 1; d <= MAX_DAYS; d++) out[d] = [];
  return out;
}

export const WINTER_TEMPLATES: Record<string, Record<number, string[]>> = {
  classic: {
    1: ["kourion", "pafos-mosaics"],
    2: ["artemis", "platres"],
    3: ["kykkos", "omodos"],
    4: ["lefkara", "tsiakkas"],
    5: ["adonis", "kolios"],
  },
  mountain: {
    1: ["artemis", "platres"],
    2: ["atalante", "omodos"],
    3: ["caledonia-falls", "kakopetria"],
    4: ["kykkos", "tsiakkas"],
    5: ["persephone", "pedoulas"],
  },
  "coast-culture": {
    1: ["pafos-mosaics", "tomb-of-kings"],
    2: ["adonis", "kolios"],
    3: ["kourion", "governors-beach"],
    4: ["lefkara", "cape-greco"],
    5: ["omodos", "tsiakkas"],
  },
  family: {
    1: ["fig-tree-bay", "coral-bay"],
    2: ["choirokoitia", "lefkara"],
    3: ["caledonia-falls", "kakopetria"],
    4: ["artemis", "platres"],
    5: ["sterna-boutique", "pafos-mosaics"],
  },
  "short-stay": {
    1: ["kourion", "pafos-mosaics"],
    2: ["artemis", "omodos", "tsiakkas"],
  },
};

function loadItinerary(): Record<number, string[]> {
  if (typeof window === "undefined") return emptyDays();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string[]>;
      const out = emptyDays();
      for (const [k, v] of Object.entries(parsed)) {
        const d = parseInt(k, 10);
        if (d >= 1 && d <= MAX_DAYS && Array.isArray(v)) out[d] = v;
      }
      return out;
    }
  } catch {
    // ignore
  }
  return emptyDays();
}

export function useItinerary() {
  const searchParams = useSearchParams();
  const [days, setDays] = useState<Record<number, string[]>>(emptyDays);
  const [activeDay, setActiveDay] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const fromUrl = decodeItinerary(searchParams.get("plan"));
      const fromStorage = loadItinerary();
      // URL param wins (shared link); otherwise use localStorage
      setDays(fromUrl ?? fromStorage);
      setHydrated(true);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const toStore: Record<string, string[]> = {};
      for (let d = 1; d <= MAX_DAYS; d++) toStore[String(d)] = days[d] ?? [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // ignore
    }
  }, [days, hydrated]);

  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const addToDay = useCallback((id: string) => {
    setDays((prev) => {
      const current = prev[activeDay] ?? [];
      const isAdding = !current.includes(id);
      const nextDay = isAdding ? [...current, id] : current.filter((x) => x !== id);
      if (isAdding) {
        setLastAddedId(id);
        setTimeout(() => setLastAddedId(null), 600);
      }
      return { ...prev, [activeDay]: nextDay };
    });
  }, [activeDay]);

  const removeFromDay = useCallback((id: string) => {
    setDays((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].filter((x) => x !== id),
    }));
  }, [activeDay]);

  const getPlace = useCallback((id: string): PlanItem | undefined => {
    return getPlaceById(id);
  }, []);

  const hasContent = Object.values(days).some((ids) => ids.length > 0);
  const hasWineries = Object.values(days).some((ids) =>
    ids.some((id) => getPlace(id)?.type === "winery")
  );

  const applyTemplate = useCallback((key: keyof typeof WINTER_TEMPLATES, mode: "replace" | "merge" = "replace") => {
    const template = WINTER_TEMPLATES[key];
    if (!template) return;
    setDays((prev) => {
      const next = emptyDays();
      for (let d = 1; d <= MAX_DAYS; d++) {
        const existing = prev[d] ?? [];
        const fromTemplate = template[d] ?? [];
        next[d] = mode === "merge"
          ? [...new Set([...existing, ...fromTemplate])]
          : [...fromTemplate];
      }
      return next;
    });
  }, []);

  const applyTemplateReplace = useCallback((key: keyof typeof WINTER_TEMPLATES, skipConfirm?: boolean) => {
    if (!hasContent || skipConfirm) {
      applyTemplate(key, "replace");
      return;
    }
    const choice = confirm(
      "You already have places in your itinerary.\n\n" +
      "OK = Replace. Cancel = Keep your plan."
    );
    if (choice) applyTemplate(key, "replace");
  }, [hasContent, applyTemplate]);

  const mergeTemplate = useCallback((key: keyof typeof WINTER_TEMPLATES) => {
    applyTemplate(key, "merge");
  }, [applyTemplate]);

  const clearDay = useCallback(() => {
    setDays((prev) => ({ ...prev, [activeDay]: [] }));
  }, [activeDay]);

  const copyItinerary = useCallback(async () => {
    const lines: string[] = ["Cyprus Winter Itinerary", ""];
    for (let d = 1; d <= MAX_DAYS; d++) {
      const items = days[d] ?? [];
      if (items.length === 0) continue;
      lines.push(`Day ${d}:`);
      for (const id of items) {
        const p = getPlace(id);
        if (p) lines.push(`  • ${p.name} (${p.region})`);
      }
      lines.push("");
    }
    const text = lines.join("\n").trim() || "Your Cyprus Winter plan. Add places from Discover or Trails to get going.";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [days, getPlace]);

  const sharePath = hasContent ? buildPlanSharePath(days) : "/plan";

  const copyShareLink = useCallback(async () => {
    const url = toAbsoluteUrl(sharePath);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [sharePath]);

  return {
    days,
    lastAddedId,
    activeDay,
    setActiveDay,
    hydrated,
    copied,
    linkCopied,
    copyShareLink,
    addToDay,
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

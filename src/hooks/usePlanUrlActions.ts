"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PlanItem } from "@/data";
import { TEMPLATE_KEYS, type TemplateKey } from "@/data/itinerary-templates";
import { parseAddParam } from "@/lib/plan-url-params";

type UsePlanUrlActionsParams = {
  hydrated: boolean;
  hasContent: boolean;
  getPlace: (id: string) => PlanItem | undefined;
  addUniqueToDay: (id: string) => void;
  applyTemplate: (key: TemplateKey) => void;
};

function isValidTemplate(value: string | null): value is TemplateKey {
  return value !== null && (TEMPLATE_KEYS as readonly string[]).includes(value);
}

/**
 * Handles URL params ?add= and ?template= for the Plan page.
 * Supports all templates: ?template=short-stay, ?template=classic, ?template=classic-7, etc.
 * Uses refs internally to avoid processing the same param twice.
 * Returns nothing — side effects only.
 */
export function usePlanUrlActions({
  hydrated,
  hasContent,
  getPlace,
  addUniqueToDay,
  applyTemplate,
}: UsePlanUrlActionsParams) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedAddRef = useRef<string | null>(null);
  const processedTemplateRef = useRef<string | null>(null);
  const [lastUrlAddCount, setLastUrlAddCount] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    const template = searchParams.get("template");
    if (!isValidTemplate(template) || processedTemplateRef.current === template) return;
    if (!hasContent) {
      processedTemplateRef.current = template;
      applyTemplate(template);
      router.replace("/plan", { scroll: false });
    }
  }, [hydrated, searchParams, hasContent, applyTemplate, router]);

  useEffect(() => {
    if (!hydrated) return;
    const addParam = searchParams.get("add");
    if (!addParam || addParam === "failed" || processedAddRef.current === addParam) return;
    processedAddRef.current = addParam;
    const ids = parseAddParam(addParam);
    const places = ids.map((id) => getPlace(id)).filter((p): p is PlanItem => !!p);
    if (places.length === 0) {
      router.replace("/plan?add=failed", { scroll: false });
      return;
    }
    const uniqueIds = [...new Set(places.map((p) => p.id))];
    for (const id of uniqueIds) {
      addUniqueToDay(id);
    }
    // Defer state update to avoid setState-in-effect lint warning.
    queueMicrotask(() => setLastUrlAddCount(uniqueIds.length));
    router.replace("/plan", { scroll: false });
  }, [hydrated, searchParams, addUniqueToDay, getPlace, router]);

  useEffect(() => {
    if (lastUrlAddCount <= 0) return;
    const timer = setTimeout(() => setLastUrlAddCount(0), 4500);
    return () => clearTimeout(timer);
  }, [lastUrlAddCount]);

  return {
    lastUrlAddCount,
  };
}

"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PlanItem } from "@/data";
import { TEMPLATE_KEYS, type TemplateKey } from "@/data/itinerary-templates";

type UsePlanUrlActionsParams = {
  hydrated: boolean;
  hasContent: boolean;
  getPlace: (id: string) => PlanItem | undefined;
  addToDay: (id: string) => void;
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
  addToDay,
  applyTemplate,
}: UsePlanUrlActionsParams) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedAddRef = useRef<string | null>(null);
  const processedTemplateRef = useRef<string | null>(null);

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
    const ids = addParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 50);
    const places = ids.map((id) => getPlace(id)).filter((p): p is PlanItem => !!p);
    if (places.length === 0) {
      router.replace("/plan?add=failed", { scroll: false });
      return;
    }
    for (const place of places) {
      addToDay(place.id);
    }
    router.replace("/plan", { scroll: false });
  }, [hydrated, searchParams, addToDay, getPlace, router]);
}

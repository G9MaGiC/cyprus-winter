"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { PlanItem } from "@/data";
import { TEMPLATE_KEYS, type TemplateKey } from "@/data/itinerary-templates";
import { parseAddParam, patchPlanUrlSearchParams } from "@/lib/plan-url-params";
import { trackProduct } from "@/lib/analytics";

type UsePlanUrlActionsParams = {
  hydrated: boolean;
  hasContent: boolean;
  getPlace: (id: string) => PlanItem | undefined;
  addToDayIfMissing: (id: string) => void;
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
  addToDayIfMissing,
  applyTemplate,
}: UsePlanUrlActionsParams) {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const processedAddRef = useRef<string | null>(null);
  const processedTemplateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const template = searchParams.get("template");
    if (!isValidTemplate(template) || processedTemplateRef.current === template) return;
    if (!hasContent) {
      processedTemplateRef.current = template;
      applyTemplate(template);
      patchPlanUrlSearchParams((p) => p.delete("template"));
    }
  }, [hydrated, searchParams, hasContent, applyTemplate]);

  useEffect(() => {
    if (!hydrated) return;
    const addParam = searchParams.get("add");
    if (!addParam || addParam === "failed" || processedAddRef.current === addParam) return;
    processedAddRef.current = addParam;
    const ids = parseAddParam(addParam);
    const places = ids.map((id) => getPlace(id)).filter((p): p is PlanItem => !!p);
    if (places.length === 0) {
      patchPlanUrlSearchParams((p) => {
        p.delete("add");
        p.set("add", "failed");
      });
      return;
    }
    const uniqueIds = [...new Set(places.map((p) => p.id))];
    for (const id of uniqueIds) {
      addToDayIfMissing(id);
    }
    trackProduct("plan_add", {
      source: "url_add",
      locale,
      count: uniqueIds.length,
      item_id: uniqueIds.length === 1 ? uniqueIds[0] : undefined,
    });
    patchPlanUrlSearchParams((p) => p.delete("add"));
  }, [hydrated, searchParams, addToDayIfMissing, getPlace, locale]);
}

"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PlanItem } from "@/data";

type UsePlanUrlActionsParams = {
  hydrated: boolean;
  hasContent: boolean;
  getPlace: (id: string) => PlanItem | undefined;
  addToDay: (id: string) => void;
  applyTemplate: (key: "short-stay") => void;
};

/**
 * Handles URL params ?add= and ?template= for the Plan page.
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
    if (template !== "short-stay" || processedTemplateRef.current === "short-stay") return;
    if (!hasContent) {
      processedTemplateRef.current = "short-stay";
      applyTemplate("short-stay");
      router.replace("/plan", { scroll: false });
    }
  }, [hydrated, searchParams, hasContent, applyTemplate, router]);

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
  }, [hydrated, searchParams, addToDay, getPlace, router]);
}

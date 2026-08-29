"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { SECTION, TYPE } from "@/lib/design-tokens";
import type { WinterTip } from "@/data/winter-tips";

const STORAGE_KEY = "cyprus-winter-before-you-go";

function loadChecked(ids: string[]): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      return new Set(parsed.filter((id) => ids.includes(id)));
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveChecked(checked: Set<string>, ids: string[]) {
  try {
    const toStore = ids.filter((id) => checked.has(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore
  }
}

type BeforeYouGoChecklistProps = {
  tips: WinterTip[];
  className?: string;
};

export default function BeforeYouGoChecklist({
  tips,
  className = "",
}: BeforeYouGoChecklistProps) {
  const t = useTranslations("common.beforeYouGo");
  const tHome = useTranslations("home");
  const ids = useMemo(() => tips.map((tip) => tip.id), [tips]);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadChecked(ids);
    const raf = requestAnimationFrame(() => {
      setChecked(data);
      setHydrated(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [ids]);

  useEffect(() => {
    if (hydrated) saveChecked(checked, ids);
  }, [checked, ids, hydrated]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const checkedCount = checked.size;
  const totalCount = tips.length;

  return (
    <section
      aria-labelledby="before-you-go-heading"
      className={className}
    >
      <h2 id="before-you-go-heading" className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
        {t("heading")}
      </h2>
      {checkedCount === totalCount && totalCount > 0 && (
        <p className="text-sm text-terracotta font-medium mb-3" role="status">
          {t("allSet")}
        </p>
      )}
      <ul className="space-y-3" role="list">
        {tips.map((tip) => {
          const isChecked = checked.has(tip.id);
          const title = tHome(`insiderTips.${tip.id}.title`);
          const body = tHome(`insiderTips.${tip.id}.body`);
          return (
            <li key={tip.id}>
              <label
                className={`flex gap-3 text-sm leading-relaxed cursor-pointer group focus-within:ring-2 focus-within:ring-terracotta/50 focus-within:ring-offset-2 focus-within:ring-offset-background rounded-lg p-2 -m-2 transition-colors ${
                  isChecked ? "text-muted-ink" : "text-olive/90"
                }`}
              >
                <span
                  className={`shrink-0 mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-terracotta border-terracotta text-white"
                      : "border-sand-300 group-hover:border-terracotta/50"
                  }`}
                  aria-hidden
                >
                  {isChecked && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M2 6l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(tip.id)}
                  className="sr-only"
                  aria-label={`${title}. ${body}`}
                />
                <span className="break-words">
                  <strong className={isChecked ? "line-through text-muted-ink" : "text-olive"}>
                    {title}.
                  </strong>{" "}
                  {body}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

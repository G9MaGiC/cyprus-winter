"use client";

/**
 * Region facet bar for the flat mega-hubs (/wineries, /villages, /secrets —
 * 30–48k px of unfiltered scroll at 375px; AUD-68). Progressive enhancement:
 * the server renders every card with a `data-hub-group` attribute; this bar
 * only shows/hides them, so no-JS visitors and crawlers still get the full
 * list and the server markup (translations, RSC payload) stays untouched.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ClientPillFilter from "@/components/ClientPillFilter";

export type HubFilterGroup = { value: string; label: string; count: number };

type Props = {
  /** id of the element containing the `[data-hub-group]` cards to filter. */
  containerId: string;
  groups: HubFilterGroup[];
  total: number;
};

export default function HubRegionFilter({ containerId, groups, total }: Props) {
  const t = useTranslations("common.hubFilter");
  const [selected, setSelected] = useState<string | null>(null);
  const visible = selected
    ? (groups.find((g) => g.value === selected)?.count ?? total)
    : total;

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (const el of container.querySelectorAll<HTMLElement>("[data-hub-group]")) {
      const match = !selected || el.dataset.hubGroup === selected;
      el.style.display = match ? "" : "none";
    }
  }, [containerId, selected]);

  if (groups.length < 2) return null;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("aria")}>
        <ClientPillFilter
          active={!selected}
          onClick={() => setSelected(null)}
          label={t("all")}
        />
        {groups.map((g) => (
          <ClientPillFilter
            key={g.value}
            active={selected === g.value}
            onClick={() => setSelected(selected === g.value ? null : g.value)}
            label={`${g.label} (${g.count})`}
          />
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-ink" aria-live="polite">
        {t("showing", { count: visible, total })}
      </p>
    </div>
  );
}

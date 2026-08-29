"use client";

/**
 * Recently viewed items strip
 * Shows users their browsing history for quick return
 */

import { useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { CARD, TYPE, LAYOUT, SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

const PLACE_TYPE_KEYS = [
  "beach",
  "ancientSite",
  "village",
  "monastery",
  "activity",
  "winery",
  "restaurant",
  "trail",
  "event",
] as const;

type PlaceTypeKey = (typeof PLACE_TYPE_KEYS)[number];

function isPlaceTypeKey(type: string): type is PlaceTypeKey {
  return (PLACE_TYPE_KEYS as readonly string[]).includes(type);
}

const typePaths: Record<string, string> = {
  trail: "/trails",
};

function getItemPath(item: ReturnType<typeof getRecentlyViewed>[number]): string {
  const base = typePaths[item.type] || "/discover";
  return `${base}/${item.id}`;
}

export function RecentlyViewedStrip() {
  const tCommon = useTranslations("common");
  const tHome = useTranslations("home");
  const tPlaceTypes = useTranslations("common.placeTypes");
  const [items, setItems] = useState<ReturnType<typeof getRecentlyViewed>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setItems(getRecentlyViewed());
  }, []);

  if (!isClient || items.length === 0) return null;

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.pySub} bg-sand-100/50 border-y border-sand-200/50`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <div className={`flex items-center justify-between ${SECTION.titleGap}`}>
          <h2 id="recently-viewed-heading" className={`${TYPE.kicker} text-muted-ink`}>
            {tHome("recentlyViewed.title")}
          </h2>
          <button
            type="button"
            aria-label={tCommon("aria.clearRecentlyViewed")}
            onClick={() => {
              import("@/lib/recently-viewed").then(({ clearRecentlyViewed }) => {
                clearRecentlyViewed();
                setItems([]);
              });
            }}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] py-2 px-3 -m-2 text-xs text-muted-ink hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
          >
            {tHome("recentlyViewed.clear")}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none scroll-smooth scroll-touch snap-x snap-mandatory [-webkit-overflow-scrolling:touch] overscroll-x-contain touch-pan-x">
          {items.map((item) => (
            <AppLink
              key={item.id}
              href={getItemPath(item)}
              className={`group ${CARD.base} ${CARD.hover} ${CARD.link} shrink-0 snap-start p-4 min-w-[180px] max-w-[220px] border-s-4 border-s-aegean/40`}
            >
              <p className={`${TYPE.kicker} text-muted-ink mb-2`}>
                {isPlaceTypeKey(item.type) ? tPlaceTypes(item.type) : item.type}
              </p>
              <p className={`${TYPE.cardTitleCompact} truncate`}>
                {item.name}
              </p>
              <p className="text-xs text-sage mt-0.5 truncate">{item.region}</p>
            </AppLink>
          ))}
        </div>
      </div>
    </section>
  );
}

// Hook to track viewed items
export function useTrackView(item: { id: string; name: string; type: string; region: string } | null) {
  useEffect(() => {
    if (!item) return;
    
    // Debounce to avoid tracking rapid navigation
    const timer = setTimeout(() => {
      import("@/lib/recently-viewed").then(({ addToRecentlyViewed }) => {
        addToRecentlyViewed(item);
      });
    }, 1000);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);
}

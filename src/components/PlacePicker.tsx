"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { SECTION } from "@/lib/design-tokens";
import { allPlaces, getPlaceById } from "@/data";

const wineries = allPlaces.filter((p) => p.type === "winery");
const trails = allPlaces.filter((p) => p.type === "trail");
const attractions = allPlaces.filter((p) => p.type === "attraction");
const restaurants = allPlaces.filter((p) => p.type === "restaurant");
const events = allPlaces.filter((p) => p.type === "event");

type TabId = "all" | "winery" | "trail" | "attraction" | "restaurant" | "event";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "winery", label: "Wineries" },
  { id: "trail", label: "Trails" },
  { id: "attraction", label: "Attractions" },
  { id: "restaurant", label: "Eat" },
  { id: "event", label: "Events" },
];

type Place = { id: string; name: string; region: string };

type PlacePickerProps = {
  activeDayItems: string[];
  onAdd: (id: string) => void;
};

function inferPreferredTab(ids: string[]): TabId {
  let hasTrail = false;
  let hasWinery = false;
  let hasAttraction = false;
  let hasRestaurant = false;
  let hasEvent = false;
  for (const id of ids) {
    const p = getPlaceById(id);
    if (p?.type === "trail") hasTrail = true;
    if (p?.type === "winery") hasWinery = true;
    if (p?.type === "attraction") hasAttraction = true;
    if (p?.type === "restaurant") hasRestaurant = true;
    if (p?.type === "event") hasEvent = true;
  }
  if (hasTrail) return "trail";
  if (hasWinery) return "winery";
  if (hasAttraction) return "attraction";
  if (hasRestaurant) return "restaurant";
  if (hasEvent) return "event";
  return "all";
}

function filterPlaces(items: Place[], query: string): Place[] {
  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter((p) => {
    const name = p.name ?? "";
    const region = p.region ?? "";
    return name.toLowerCase().includes(q) || region.toLowerCase().includes(q);
  });
}

export default function PlacePicker({
  activeDayItems,
  onAdd,
}: PlacePickerProps) {
  const preferred = useMemo(() => inferPreferredTab(activeDayItems), [activeDayItems]);
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const prevCountRef = useRef(0);

  useEffect(() => {
    const count = activeDayItems.length;
    if (count > 0 && prevCountRef.current === 0) {
      queueMicrotask(() => setTab(preferred));
    }
    prevCountRef.current = count;
  }, [activeDayItems.length, preferred]);

  const allFiltered = useMemo(
    () => filterPlaces([...wineries, ...trails, ...attractions, ...restaurants, ...events], search),
    [search]
  );
  const wineriesFiltered = useMemo(() => filterPlaces(wineries, search), [search]);
  const trailsFiltered = useMemo(() => filterPlaces(trails, search), [search]);
  const attractionsFiltered = useMemo(() => filterPlaces(attractions, search), [search]);
  const restaurantsFiltered = useMemo(() => filterPlaces(restaurants, search), [search]);
  const eventsFiltered = useMemo(() => filterPlaces(events, search), [search]);

  const renderList = (items: Place[], tabLabel: string) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[min(50vh,360px)] sm:max-h-[360px] overflow-y-auto overscroll-contain scroll-touch touch-manipulation">
      {items.length === 0 ? (
        <p className="text-sm text-olive/60 col-span-full py-4">
          {search.trim() ? "No matches for that. Try another search, or pick a different tab." : `No ${tabLabel} in our list yet. Try another category or add from Discover.`}
        </p>
      ) : items.map((item) => {
        const isAdded = activeDayItems.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onAdd(item.id)}
            className={`text-left p-3 sm:p-4 min-h-[44px] rounded-lg border transition-all active:scale-[0.98] motion-reduce:active:scale-100 min-w-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isAdded
                ? "border-terracotta/10 bg-terracotta/10"
                : "border-sand-200/80 bg-white hover:border-terracotta/30"
            }`}
          >
            <span className="font-medium text-olive block truncate">{item.name}</span>
            <span className="text-olive/60 text-sm truncate block">({item.region})</span>
            {isAdded && (
              <span className="block text-terracotta text-xs mt-1">Added</span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <div className={SECTION.titleGap}>
        <label htmlFor="place-search" className="sr-only">
          Search places by name or region
        </label>
        <input
          id="place-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or region…"
          aria-label="Search places by name or region"
          className="w-full min-h-[44px] rounded-lg border border-sand-200/80 px-3 py-2 text-sm text-olive placeholder:text-olive/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:ring-offset-0"
        />
      </div>
      <div
        role="tablist"
        aria-label="Place categories"
        className={`flex gap-2 ${SECTION.headingGap} overflow-x-auto scroll-smooth scroll-touch pb-1 pr-4 -mx-1 sm:mx-0 sm:pr-0 sm:flex-wrap sm:overflow-visible scrollbar-none snap-x snap-mandatory`}
        onKeyDown={(e) => {
          const t = e.target as HTMLElement;
          if (t?.getAttribute?.("role") !== "tab") return;
          const idx = TABS.findIndex((tabItem) => tabItem.id === tab);
          if (e.key === "ArrowLeft" && idx > 0) {
            e.preventDefault();
            setTab(TABS[idx - 1].id);
            (e.currentTarget.querySelector(`#tab-${TABS[idx - 1].id}`) as HTMLElement)?.focus();
          } else if (e.key === "ArrowRight" && idx < TABS.length - 1) {
            e.preventDefault();
            setTab(TABS[idx + 1].id);
            (e.currentTarget.querySelector(`#tab-${TABS[idx + 1].id}`) as HTMLElement)?.focus();
          }
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`tabpanel-${t.id}`}
            id={`tab-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`shrink-0 snap-start px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] min-w-[5rem] active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              tab === t.id
                ? "bg-terracotta text-white shadow-sm"
                : "bg-sand-200/80 text-olive hover:bg-sand-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="tabpanel-all"
        aria-labelledby="tab-all"
        hidden={tab !== "all"}
        className={tab !== "all" ? "hidden" : ""}
      >
        {tab === "all" && (
          <>
            <p className="text-xs text-olive/60 mb-2">Wineries, trails, villages, events. Pick what fits your day.</p>
            {renderList(allFiltered, "places")}
          </>
        )}
      </div>
      <div
        role="tabpanel"
        id="tabpanel-winery"
        aria-labelledby="tab-winery"
        hidden={tab !== "winery"}
        className={tab !== "winery" ? "hidden" : ""}
      >
        {tab === "winery" && (
          <>
            <p className="text-xs text-olive/60 mb-2">Book ahead in winter. You&apos;ll often get the owner pouring.</p>
            {renderList(wineriesFiltered, "wineries")}
          </>
        )}
      </div>
      <div
        role="tabpanel"
        id="tabpanel-trail"
        aria-labelledby="tab-trail"
        hidden={tab !== "trail"}
        className={tab !== "trail" ? "hidden" : ""}
      >
        {tab === "trail" && (
          <>
            <p className="text-xs text-olive/60 mb-2">Start by 9am. Check conditions before you go.</p>
            {renderList(trailsFiltered, "trails")}
          </>
        )}
      </div>
      <div
        role="tabpanel"
        id="tabpanel-attraction"
        aria-labelledby="tab-attraction"
        hidden={tab !== "attraction"}
        className={tab !== "attraction" ? "hidden" : ""}
      >
        {tab === "attraction" && (
          <>
            <p className="text-xs text-olive/60 mb-2">Villages, ruins, monasteries. Weekday mornings are quietest. Winter light is softer. Plan for morning or late afternoon.</p>
            {renderList(attractionsFiltered, "attractions")}
          </>
        )}
      </div>
      <div
        role="tabpanel"
        id="tabpanel-restaurant"
        aria-labelledby="tab-restaurant"
        hidden={tab !== "restaurant"}
        className={tab !== "restaurant" ? "hidden" : ""}
      >
        {tab === "restaurant" && (
          <>
            <p className="text-xs text-olive/60 mb-2">Tavernas, fish spots, fine dining. Reserve ahead in winter for popular places.</p>
            {renderList(restaurantsFiltered, "restaurants")}
          </>
        )}
      </div>
      <div
        role="tabpanel"
        id="tabpanel-event"
        aria-labelledby="tab-event"
        hidden={tab !== "event"}
        className={tab !== "event" ? "hidden" : ""}
      >
        {tab === "event" && (
          <>
            <p className="text-xs text-olive/60 mb-2">Epiphany, carnival, markets. Dates may shift year to year—check official sources.</p>
            {renderList(eventsFiltered, "events")}
          </>
        )}
      </div>
    </div>
  );
}

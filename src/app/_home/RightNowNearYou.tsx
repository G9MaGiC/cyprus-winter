"use client";

import { useState, useCallback, useEffect } from "react";
import { LAYOUT, TYPE } from "@/lib/design-tokens";
import RightNowCard, { type RightNowItem } from "@/components/RightNowCard";
import AppLink from "@/components/AppLink";
import { REGION_CONFIGS, type RegionSlug } from "@/data/regions";
import { getCentroidBySlug } from "@/data/region-centroids";

const CONSENT_KEY = "cyprus-winter:location-consent";
const LARNACA = { lat: 34.92, lng: 33.63 };
const MAX_KM_NEAR = 25;

type State = "consent" | "region-picker" | "loading" | "loaded" | "denied" | "error" | "empty";
type ErrorCode = "rate_limited" | null;
type DistanceMode = "less" | "more";
type SourceMode = "gps" | "region";

function getRegionLabel(slug: RegionSlug): string {
  const c = REGION_CONFIGS.find((r) => r.slug === slug);
  if (c) {
    if (slug === "troodos") return "Troodos";
    if (slug === "paphos") return "Paphos";
    if (slug === "limassol") return "Limassol";
    if (slug === "larnaca") return "Larnaca";
    if (slug === "ayia-napa") return "Ayia Napa & Cape Greco";
  }
  return slug;
}

function SectionShell({
  children,
  title = "Right now near you",
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section
      id="right-now"
      aria-labelledby="right-now-heading"
      className={`py-5 sm:py-6 ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2
          id="right-now-heading"
          className={`${TYPE.sectionTitle} mb-3`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-olive/80 mb-3">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}

function DistanceToggle({
  value,
  onChange,
}: {
  value: DistanceMode;
  onChange: (v: DistanceMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Distance"
      className="inline-flex rounded-lg border border-sand-200/80 bg-sand-50/60 p-0.5 gap-px"
    >
      <button
        type="button"
        onClick={() => onChange("less")}
        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          value === "less"
            ? "bg-white text-olive shadow-sm"
            : "text-olive/70 hover:text-olive"
        }`}
      >
        Closer
      </button>
      <button
        type="button"
        onClick={() => onChange("more")}
        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          value === "more"
            ? "bg-white text-olive shadow-sm"
            : "text-olive/70 hover:text-olive"
        }`}
      >
        Farther
      </button>
    </div>
  );
}

type RightNowNearYouProps = { title?: string };

export default function RightNowNearYou({ title = "Right now near you" }: RightNowNearYouProps) {
  const [state, setState] = useState<State>("consent");
  const [items, setItems] = useState<RightNowItem[]>([]);
  const [lastErrorCode, setLastErrorCode] = useState<ErrorCode>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMode, setDistanceMode] = useState<DistanceMode>("less");
  const [sourceMode, setSourceMode] = useState<SourceMode>("gps");
  const [selectedRegion, setSelectedRegion] = useState<RegionSlug | null>(null);

  const fetchFeed = useCallback(
    async (
      lat: number,
      lng: number,
      nearOnly: boolean,
      mode: SourceMode,
      region: RegionSlug | null
    ) => {
      setState("loading");
      setItems([]);
      setLastErrorCode(null);
      setCoords({ lat, lng });
      setSourceMode(mode);
      setSelectedRegion(region);
      try {
        const maxQuery = nearOnly ? `&maxDistance=${MAX_KM_NEAR}` : "";
        const res = await fetch(
          `/api/right-now?lat=${lat}&lng=${lng}&limit=4${maxQuery}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 429) {
            setLastErrorCode("rate_limited");
            setState("error");
            return;
          }
          if (res.status === 400 && data.error?.message) {
            setLastErrorCode(null);
            setState("error");
            return;
          }
          setLastErrorCode(null);
          setState("error");
          return;
        }
        const data = await res.json();
        const list = data.items ?? [];
        setItems(list);
        setState(list.length > 0 ? "loaded" : "empty");
      } catch {
        setLastErrorCode(null);
        setState("error");
      }
    },
    []
  );

  const handleUseLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CONSENT_KEY, "true");
    } catch {}
    const doFetch = (lat: number, lng: number) =>
      fetchFeed(lat, lng, distanceMode === "less", "gps", null);
    if (!navigator.geolocation) {
      doFetch(LARNACA.lat, LARNACA.lng);
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => doFetch(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        if (err.code === 1) setState("denied");
        else doFetch(LARNACA.lat, LARNACA.lng);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchFeed, distanceMode]);

  const handlePickRegion = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CONSENT_KEY, "true");
      } catch {}
    }
    setState("region-picker");
  }, []);

  const handleRegionSelect = useCallback(
    (slug: RegionSlug) => {
      const centroid = getCentroidBySlug(slug);
      fetchFeed(centroid.lat, centroid.lng, distanceMode === "less", "region", slug);
    },
    [fetchFeed, distanceMode]
  );

  const handleDistanceChange = useCallback(
    (mode: DistanceMode) => {
      setDistanceMode(mode);
      if (coords && (state === "loaded" || state === "empty")) {
        const region = selectedRegion;
        const src = sourceMode;
        fetchFeed(coords.lat, coords.lng, mode === "less", src, region);
      }
    },
    [coords, state, selectedRegion, sourceMode, fetchFeed]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const consented = localStorage.getItem(CONSENT_KEY) === "true";
      if (consented) {
        queueMicrotask(() => handleUseLocation());
      }
    } catch {
      queueMicrotask(() => setState("consent"));
    }
  }, [handleUseLocation]);

  if (state === "consent") {
    return (
      <SectionShell title={title}>
        <div className="rounded-lg border border-sand-200/50 py-4 px-4 bg-sand-50/50">
          <p className="text-olive/80 text-sm">
            Suggestions based on where you are, the time, and the weather.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUseLocation}
              className="px-3 py-1.5 rounded-md bg-terracotta text-white text-sm font-medium hover:bg-terracotta-muted transition-colors min-h-[44px]"
            >
              Use my location
            </button>
            <button
              type="button"
              onClick={handlePickRegion}
              className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-md text-olive/70 text-sm hover:text-olive transition-colors"
            >
              Pick a region
            </button>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (state === "region-picker") {
    return (
      <SectionShell title={title}>
        <div className="rounded-lg border border-sand-200/50 py-4 px-4 bg-sand-50/50">
          <p className="text-olive/80 text-sm mb-3">Choose a region to explore.</p>
          <div className="flex flex-wrap gap-2">
            {REGION_CONFIGS.map((config) => (
              <button
                key={config.slug}
                type="button"
                onClick={() => handleRegionSelect(config.slug)}
                className="min-h-[44px] px-3 py-2 rounded-md border border-sand-200/80 bg-white text-olive text-sm font-medium hover:bg-sand-50/60 transition-colors"
              >
                {getRegionLabel(config.slug)}
              </button>
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (state === "loading") {
    return (
      <SectionShell>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden border border-sand-200/60 bg-white flex sm:block"
              aria-hidden
            >
              <div className="w-20 h-20 sm:w-full sm:aspect-[4/3] shrink-0 bg-olive/10 animate-pulse" />
              <div className="flex-1 p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                <div className="h-3.5 sm:h-4 w-3/4 bg-olive/20 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-olive/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (state === "denied" || state === "error") {
    const errorMessage =
      state === "denied"
        ? "Enable location or pick a region."
        : lastErrorCode === "rate_limited"
          ? "Too many requests. Try again in a minute."
          : "Couldn't load. Try again shortly.";
    return (
      <SectionShell title={title}>
        <div className="rounded-lg border border-sand-200/50 py-4 px-4 bg-sand-50/50">
          <p className="text-olive/80 text-sm">{errorMessage}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUseLocation}
              className="px-3 py-1.5 rounded-md bg-terracotta text-white text-sm font-medium hover:bg-terracotta-muted transition-colors min-h-[44px]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handlePickRegion}
              className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-md text-olive/70 text-sm hover:text-olive transition-colors"
            >
              Pick a region
            </button>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (state === "empty") {
    const subtitle =
      sourceMode === "region" && selectedRegion
        ? `Suggestions in ${getRegionLabel(selectedRegion)}`
        : undefined;
    return (
      <SectionShell title={title} subtitle={subtitle}>
        <div className="rounded-lg border border-sand-200/50 py-4 px-4 bg-sand-50/50">
          <p className="text-olive/80 text-sm">
            No suggestions for {sourceMode === "region" ? "this region" : "now"} right now.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {sourceMode === "region" && (
              <button
                type="button"
                onClick={handlePickRegion}
                className="px-3 py-2 rounded-md border border-sand-200/80 text-olive/80 text-sm hover:text-olive"
              >
                Change region
              </button>
            )}
            <AppLink
              href="/discover"
              className="inline-block text-sm text-olive/70 hover:text-olive"
            >
              See more in Discover →
            </AppLink>
          </div>
        </div>
      </SectionShell>
    );
  }

  const loadedSubtitle =
    sourceMode === "region" && selectedRegion
      ? `Suggestions in ${getRegionLabel(selectedRegion)}`
      : "Suggestions near you";

  return (
    <SectionShell title={title} subtitle={loadedSubtitle}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <DistanceToggle value={distanceMode} onChange={handleDistanceChange} />
        <AppLink
          href="/discover"
          className="text-xs text-olive/70 hover:text-olive"
        >
          See more →
        </AppLink>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {items.map((item) => (
          <RightNowCard key={item.id} item={item} />
        ))}
      </div>
    </SectionShell>
  );
}

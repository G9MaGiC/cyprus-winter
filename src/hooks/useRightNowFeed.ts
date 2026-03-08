"use client";

import { useState, useCallback, useEffect } from "react";
import type { RightNowItem } from "@/components/RightNowCard";
import { getCentroidBySlug } from "@/data/region-centroids";
import type { RegionSlug } from "@/data/regions";

const CONSENT_KEY = "cyprus-winter:location-consent";
const MAX_KM_NEAR = 25;

export type RightNowState =
  | "consent"
  | "region-picker"
  | "loading"
  | "loaded"
  | "denied"
  | "error"
  | "empty";
export type DistanceMode = "less" | "more";
export type SourceMode = "gps" | "region";

export type UseRightNowFeedReturn = {
  state: RightNowState;
  items: RightNowItem[];
  lastErrorCode: "rate_limited" | null;
  coords: { lat: number; lng: number } | null;
  distanceMode: DistanceMode;
  sourceMode: SourceMode;
  selectedRegion: RegionSlug | null;
  handleUseLocation: () => void;
  handlePickRegion: () => void;
  handleRegionSelect: (slug: RegionSlug) => void;
  handleDistanceChange: (mode: DistanceMode) => void;
};

export function useRightNowFeed(): UseRightNowFeedReturn {
  const [state, setState] = useState<RightNowState>("consent");
  const [items, setItems] = useState<RightNowItem[]>([]);
  const [lastErrorCode, setLastErrorCode] = useState<"rate_limited" | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
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
        const regionQuery =
          mode === "region" && region ? `&region=${encodeURIComponent(region)}` : "";
        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/api/right-now?lat=${lat}&lng=${lng}&limit=4${maxQuery}${regionQuery}`
            : `/api/right-now?lat=${lat}&lng=${lng}&limit=4${maxQuery}${regionQuery}`;
        const res = await fetch(url);
        if (!res.ok) {
          await res.json().catch(() => ({})); // consume body
          if (res.status === 429) {
            setLastErrorCode("rate_limited");
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
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[RightNow] fetch error:", err);
        }
        setLastErrorCode(null);
        setState("error");
      }
    },
    []
  );

  const handleUseLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    setState("loading");
    const doFetch = (lat: number, lng: number) =>
      fetchFeed(lat, lng, distanceMode === "less", "gps", null);
    try {
      localStorage.setItem(CONSENT_KEY, "true");
    } catch {}
    try {
      if (!navigator.geolocation) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[RightNow] navigator.geolocation unavailable");
        }
        setState("region-picker");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => doFetch(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          if (process.env.NODE_ENV === "development") {
            console.warn("[RightNow] geolocation error:", err.code, err.message);
          }
          if (err.code === 1) {
            setState("denied");
          } else {
            setState("region-picker");
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RightNow] geolocation threw:", e);
      }
      setState("region-picker");
    }
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
      fetchFeed(
        centroid.lat,
        centroid.lng,
        distanceMode === "less",
        "region",
        slug
      );
    },
    [fetchFeed, distanceMode]
  );

  const handleDistanceChange = useCallback(
    (mode: DistanceMode) => {
      setDistanceMode(mode);
      if (coords && (state === "loaded" || state === "empty")) {
        fetchFeed(
          coords.lat,
          coords.lng,
          mode === "less",
          sourceMode,
          selectedRegion
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    items,
    lastErrorCode,
    coords,
    distanceMode,
    sourceMode,
    selectedRegion,
    handleUseLocation,
    handlePickRegion,
    handleRegionSelect,
    handleDistanceChange,
  };
}

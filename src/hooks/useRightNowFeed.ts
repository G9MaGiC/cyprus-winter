"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RightNowItem } from "@/components/RightNowCard";
import { getCentroidBySlug } from "@/data/region-centroids";
import type { RegionSlug } from "@/data/regions";

const CONSENT_KEY = "cyprus-winter:location-consent";
const MAX_KM_NEAR = 25;
const STALE_MS = 5 * 60 * 1000; // 5 min shared cache

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

async function fetchRightNow(
  lat: number,
  lng: number,
  nearOnly: boolean,
  region: RegionSlug | null
): Promise<RightNowItem[]> {
  const maxQuery = nearOnly ? `&maxDistance=${MAX_KM_NEAR}` : "";
  const regionQuery =
    region ? `&region=${encodeURIComponent(region)}` : "";
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/right-now?lat=${lat}&lng=${lng}&limit=4${maxQuery}${regionQuery}`
      : `/api/right-now?lat=${lat}&lng=${lng}&limit=4${maxQuery}${regionQuery}`;
  const res = await fetch(url);
  if (!res.ok) {
    await res.json().catch(() => ({}));
    const err = new Error("Right Now fetch failed") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.items ?? [];
}

export function useRightNowFeed(): UseRightNowFeedReturn {
  const isMountedRef = useRef(true);
  const [state, setState] = useState<RightNowState>("consent");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMode, setDistanceMode] = useState<DistanceMode>("less");
  const [sourceMode, setSourceMode] = useState<SourceMode>("gps");
  const [selectedRegion, setSelectedRegion] = useState<RegionSlug | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const queryEnabled =
    coords !== null && typeof window !== "undefined";
  const nearOnly = distanceMode === "less";

  const {
    data: items = [],
    isLoading: queryLoading,
    isError: queryError,
    error: queryErr,
  } = useQuery({
    queryKey: ["right-now", coords?.lat, coords?.lng, nearOnly, selectedRegion ?? ""],
    queryFn: () =>
      fetchRightNow(
        coords!.lat,
        coords!.lng,
        nearOnly,
        sourceMode === "region" ? selectedRegion : null
      ),
    enabled: queryEnabled,
    staleTime: STALE_MS,
  });

  const lastErrorCode: "rate_limited" | null =
    queryError && queryErr && "status" in queryErr && queryErr.status === 429
      ? "rate_limited"
      : null;

  // Derive state from query + pre-query UI
  useEffect(() => {
    if (!queryEnabled) return;
    if (queryLoading) setState("loading");
    else if (queryError) setState("error");
    else setState(items.length > 0 ? "loaded" : "empty");
  }, [queryEnabled, queryLoading, queryError, items.length]);

  const handleUseLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    setState("loading");
    try {
      localStorage.setItem(CONSENT_KEY, "true");
    } catch {}
    try {
      if (!navigator.geolocation) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[RightNow] navigator.geolocation unavailable");
        }
        if (isMountedRef.current) setState("region-picker");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isMountedRef.current) {
            setSourceMode("gps");
            setSelectedRegion(null);
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        (err) => {
          if (process.env.NODE_ENV === "development") {
            console.warn("[RightNow] geolocation error:", err.code, err.message);
          }
          if (isMountedRef.current) {
            setState(err.code === 1 ? "denied" : "region-picker");
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RightNow] geolocation threw:", e);
      }
      if (isMountedRef.current) setState("region-picker");
    }
  }, []);

  const handlePickRegion = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CONSENT_KEY, "true");
      } catch {}
    }
    setState("region-picker");
  }, []);

  const handleRegionSelect = useCallback((slug: RegionSlug) => {
    const centroid = getCentroidBySlug(slug);
    setSourceMode("region");
    setSelectedRegion(slug);
    setCoords({ lat: centroid.lat, lng: centroid.lng });
  }, []);

  const handleDistanceChange = useCallback(
    (mode: DistanceMode) => {
      setDistanceMode(mode);
      // Coords already set; query key change triggers refetch via React Query
    },
    []
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

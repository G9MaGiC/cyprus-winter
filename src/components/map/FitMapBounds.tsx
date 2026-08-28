"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";

type FitMapBoundsProps = {
  bounds: LatLngBoundsExpression | null;
  animate?: boolean;
};

/** Fit Leaflet map to bounds when they change. */
export default function FitMapBounds({ bounds, animate = true }: FitMapBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [map]);

  useEffect(() => {
    if (!bounds) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const fit = () => {
      map.invalidateSize({ animate: false });
      map.fitBounds(bounds, {
        padding: [24, 24],
        maxZoom: 14,
        animate: animate && !prefersReduced,
      });
    };
    fit();
    const frame = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(frame);
  }, [map, bounds, animate]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

type MapInteractionGuardProps = {
  interactive: boolean;
};

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}

/**
 * On touch devices, Leaflet can trap scroll by capturing drag/pinch gestures.
 * This guard lets callers opt-in to interactions explicitly.
 */
export default function MapInteractionGuard({ interactive }: MapInteractionGuardProps) {
  const map = useMap();

  useEffect(() => {
    // Desktop behavior remains: scroll-wheel is gated by MapScrollWheelToggle.
    if (!isCoarsePointer()) return;

    const container = map.getContainer();
    if (!interactive) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      map.scrollWheelZoom.disable();
      // Leaflet “tap” is optional depending on plugin/bundle.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).tap?.disable?.();
      container.style.touchAction = "pan-y";
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      // scrollWheelZoom is still intentionally gated by MapScrollWheelToggle on desktop;
      // on mobile, enabling it is harmless but rarely used.
      map.scrollWheelZoom.enable();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).tap?.enable?.();
      container.style.touchAction = "auto";
    }
  }, [interactive, map]);

  return null;
}


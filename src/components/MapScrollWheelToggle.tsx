"use client";

import { useEffect } from "react";
import { useMap, useMapEvent } from "react-leaflet";

/**
 * Disables scroll-wheel zoom by default so mobile users can scroll past maps.
 * Enables zoom on click; disables again on mouse-leave.
 */
export default function MapScrollWheelToggle() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();
  }, [map]);

  useMapEvent("click", () => {
    map.scrollWheelZoom.enable();
  });

  useEffect(() => {
    const container = map.getContainer();
    const handleLeave = () => map.scrollWheelZoom.disable();
    container.addEventListener("mouseleave", handleLeave);
    return () => container.removeEventListener("mouseleave", handleLeave);
  }, [map]);

  return null;
}

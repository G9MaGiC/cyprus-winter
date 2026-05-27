"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import MapScrollWheelToggle from "@/components/MapScrollWheelToggle";
import MapInteractionGuard from "@/components/MapInteractionGuard";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Trail } from "@/data/trails";
import { TOKENS, MAP_ICON_SHADOW, MAP_ICON_SHADOW_SM, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Fix default marker icons in Next.js
const trailheadIcon = L.divIcon({
  html: `<span style="
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${TOKENS.terracotta};
    color: white;
    border-radius: 50%;
    font-weight: 700;
    font-size: 16px;
    box-shadow: ${MAP_ICON_SHADOW};
    border: 3px solid white;
  ">▶</span>`,
  className: "custom-marker",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function waypointIcon(index: number) {
  return L.divIcon({
    html: `<span style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: ${TOKENS.sage};
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 12px;
      box-shadow: ${MAP_ICON_SHADOW_SM};
      border: 2px solid white;
    ">${index}</span>`,
    className: "custom-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  if (positions.length > 0) {
    map.fitBounds(positions as [number, number][], { padding: [24, 24], maxZoom: 14 });
  }
  return null;
}

type TrailMapProps = {
  trail: Trail;
  className?: string;
};

export default function TrailMap({ trail, className = "" }: TrailMapProps) {
  const tCommon = useTranslations("common");
  const tTrailsMap = useTranslations("trails.map");

  const [interactive, setInteractive] = useState(() => {
    if (typeof window === "undefined") return true;
    return !(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  });

  const hasTrailhead = trail.trailheadCoords != null;
  const waypointsWithCoords = trail.waypoints?.filter((w) => w.lat != null && w.lng != null) ?? [];

  if (!hasTrailhead && waypointsWithCoords.length === 0) return null;

  const positions: [number, number][] = [];
  if (trail.trailheadCoords) {
    positions.push([trail.trailheadCoords.lat, trail.trailheadCoords.lng]);
  }
  waypointsWithCoords.forEach((w) => {
    if (w.lat != null && w.lng != null) positions.push([w.lat, w.lng]);
  });

  const center = trail.trailheadCoords ?? waypointsWithCoords[0];
  const centerLat = center?.lat;
  const centerLng = center?.lng;
  if (centerLat == null || centerLng == null) return null;

  const polylinePositions: [number, number][] = [];
  if (trail.trailheadCoords) polylinePositions.push([trail.trailheadCoords.lat, trail.trailheadCoords.lng]);
  waypointsWithCoords.forEach((w) => {
    if (w.lat != null && w.lng != null) polylinePositions.push([w.lat, w.lng]);
  });

  const directionsUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className={`relative overflow-hidden rounded-lg border border-sand-200/70 bg-sand-100/50 ${className}`}>
      {!interactive && (
        <div className="absolute inset-0 z-[5] flex items-end justify-center p-3 pointer-events-none">
          <button
            type="button"
            onClick={() => setInteractive(true)}
            className="pointer-events-auto inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-full bg-white/95 border border-sand-200/80 text-sm font-medium text-olive shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tCommon("map.enableMapAria")}
          >
            {tCommon("map.enableMapCta")}
          </button>
        </div>
      )}
      {interactive && (
        <div className="absolute top-3 right-3 z-[5]">
          <button
            type="button"
            onClick={() => setInteractive(false)}
            className="inline-flex items-center justify-center min-h-[36px] px-3 py-2 rounded-full bg-white/90 border border-sand-200/80 text-xs font-medium text-olive/80 hover:text-olive hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tCommon("map.disableMapAria")}
          >
            {tCommon("map.disableMapCta")}
          </button>
        </div>
      )}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-[280px] sm:h-[340px] w-full z-0"
        attributionControl={true}
      >
        <MapInteractionGuard interactive={interactive} />
        <MapScrollWheelToggle />
        <TileLayer
          attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">${tCommon("map.openStreetMap")}</a>`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: TOKENS.terracotta,
              weight: 4,
              opacity: 0.8,
              dashArray: "8 6",
            }}
          />
        )}
        {trail.trailheadCoords && (
          <Marker
            position={[trail.trailheadCoords.lat, trail.trailheadCoords.lng]}
            icon={trailheadIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className={`${TYPE.cardTitle} mb-1`}>{tTrailsMap("trailheadLegend")}</p>
                {trail.trailhead && (
                  <p className="text-sm text-olive/80 mb-2">{trail.trailhead}</p>
                )}
                <a
                  href={directionsUrl(trail.trailheadCoords.lat, trail.trailheadCoords.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-terracotta hover:underline"
                >
                    {tCommon("map.getDirections")} →
                </a>
              </div>
            </Popup>
          </Marker>
        )}
        {waypointsWithCoords.map((w, i) => {
          if (w.lat == null || w.lng == null) return null;
          const isTrailhead = trail.trailheadCoords && w.lat === trail.trailheadCoords.lat && w.lng === trail.trailheadCoords.lng;
          if (isTrailhead) return null;
          return (
            <Marker key={i} position={[w.lat, w.lng]} icon={waypointIcon(i + 1)}>
              <Popup>
                <div className="min-w-[200px]">
                  <p className={`${TYPE.cardTitle} mb-0.5`}>{w.name}</p>
                  {w.km != null && (
                    <p className="text-xs text-olive/60 mb-1">@ {w.km} km</p>
                  )}
                  {w.note && (
                    <p className="text-sm text-olive/80 mb-2">{w.note}</p>
                  )}
                  <a
                    href={directionsUrl(w.lat, w.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-terracotta hover:underline"
                  >
                    {tCommon("map.getDirections")} →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <FitBounds positions={positions} />
      </MapContainer>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-sand-100/80 border-t border-sand-200/70">
        <p className="text-xs text-olive/70">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full bg-terracotta border-2 border-white shadow-sm"
              aria-hidden
            />
            {tTrailsMap("trailheadLegend")}
          </span>
          {waypointsWithCoords.some((w) => {
            const tc = trail.trailheadCoords;
            return !tc || w.lat !== tc.lat || w.lng !== tc.lng;
          }) && (
            <>
              <span className="mx-2 text-olive/40">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-sage border-2 border-white shadow-sm"
                  aria-hidden
                />
                {tTrailsMap("stops")}
              </span>
            </>
          )}
        </p>
        <a
          href={trail.trailheadCoords ? directionsUrl(trail.trailheadCoords.lat, trail.trailheadCoords.lng) : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-terracotta hover:underline"
        >
          {tCommon("map.openInMaps")} →
        </a>
      </div>
    </div>
  );
}

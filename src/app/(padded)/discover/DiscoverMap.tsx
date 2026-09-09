"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapScrollWheelToggle from "@/components/MapScrollWheelToggle";
import MapInteractionGuard from "@/components/MapInteractionGuard";
import FitMapBounds from "@/components/map/FitMapBounds";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLink from "@/components/AppLink";
import { TOKENS, MAP_ICON_SHADOW, MAP_ICON_SHADOW_SM, TYPE, LAYER } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { getLocalizedName } from "@/lib/localize";
import type { MapBounds } from "@/lib/discover-map-focus";

export type DiscoverMapPinKind =
  | "winery"
  | "village"
  | "trail"
  | "eat"
  | "ancient"
  | "coast"
  | "monastery"
  | "activity"
  | "other";

export type DiscoverMapPlace = {
  id: string;
  name: string;
  /** Greek-first popup titles, same contract as the cards (AUD-100 / batch 82). */
  nameEl?: string;
  href: string;
  region: string;
  lat: number;
  lng: number;
  kind: DiscoverMapPinKind;
  planDay?: number;
};

const KIND_COLORS: Record<DiscoverMapPinKind, string> = {
  winery: TOKENS.golden,
  village: TOKENS.terracotta,
  trail: TOKENS.sage,
  eat: TOKENS.charcoal,
  ancient: TOKENS.olive,
  coast: TOKENS.aegean,
  monastery: TOKENS.terracotta,
  activity: TOKENS.sage,
  other: TOKENS.terracotta,
};

const KIND_GLYPH: Record<DiscoverMapPinKind, string> = {
  winery: "W",
  village: "V",
  trail: "T",
  eat: "E",
  ancient: "A",
  coast: "C",
  monastery: "M",
  activity: "•",
  other: "•",
};

function iconForKind(kind: DiscoverMapPinKind, highlighted: boolean): L.DivIcon {
  const size = highlighted ? 32 : 28;
  const fontSize = highlighted ? 11 : 10;
  const border = highlighted ? "3px solid #fff" : "2px solid white";
  const ring = highlighted ? `0 0 0 2px ${KIND_COLORS[kind]}` : "none";
  return L.divIcon({
    html: `<span style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: ${size}px;
      height: ${size}px;
      background: ${KIND_COLORS[kind]};
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: ${fontSize}px;
      box-shadow: ${highlighted ? MAP_ICON_SHADOW : MAP_ICON_SHADOW_SM};
      border: ${border};
      outline: ${ring};
    ">${KIND_GLYPH[kind]}</span>`,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const CYPRUS_CENTER: [number, number] = [34.95, 33.2];

type DiscoverMapProps = {
  places: DiscoverMapPlace[];
  className?: string;
  focusBounds?: MapBounds | null;
  highlightIds?: Set<string>;
  dimUnhighlighted?: boolean;
  showFooter?: boolean;
};

export default function DiscoverMap({
  places,
  className = "",
  focusBounds = null,
  highlightIds,
  dimUnhighlighted = false,
  showFooter = true,
}: DiscoverMapProps) {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const tDiscover = useTranslations("discover");
  const [interactive, setInteractive] = useState(true);

  useEffect(() => {
    setInteractive(!(window.matchMedia?.("(pointer: coarse)").matches ?? false));
  }, []);

  const displayBounds = useMemo((): MapBounds | null => {
    if (focusBounds) return focusBounds;
    if (places.length === 0) return null;
    if (places.length === 1) {
      const p = places[0];
      const pad = 0.08;
      return [
        [p.lat - pad, p.lng - pad],
        [p.lat + pad, p.lng + pad],
      ];
    }
    const lats = places.map((p) => p.lat);
    const lngs = places.map((p) => p.lng);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [focusBounds, places]);

  if (places.length === 0) return null;

  return (
    <div
      className={`relative flex flex-col h-full min-h-[280px] overflow-hidden ${className}`}
      role="application"
      aria-label={tDiscover("map.ariaLabel", { count: places.length })}
    >
      {!interactive && (
        <div className={`absolute inset-0 ${LAYER.mapOverlay} flex items-end justify-center p-3 pointer-events-none`}>
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
        <div className={`absolute top-3 end-3 ${LAYER.mapOverlay}`}>
          <button
            type="button"
            onClick={() => setInteractive(false)}
            className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 rounded-full bg-white/90 border border-sand-200/80 text-xs font-medium text-muted-ink hover:text-olive hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tCommon("map.disableMapAria")}
          >
            {tCommon("map.disableMapCta")}
          </button>
        </div>
      )}
      <MapContainer
        center={CYPRUS_CENTER}
        zoom={8}
        scrollWheelZoom={false}
        className="flex-1 min-h-[280px] w-full z-0"
        attributionControl={true}
      >
        <MapInteractionGuard interactive={interactive} />
        <MapScrollWheelToggle />
        {displayBounds ? <FitMapBounds bounds={displayBounds} /> : null}
        <TileLayer
          attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">${tDiscover("map.openStreetMap")}</a>`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((p) => {
          const highlighted = highlightIds?.has(p.id) ?? false;
          const dimmed = dimUnhighlighted && highlightIds && highlightIds.size > 0 && !highlighted;
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={iconForKind(p.kind, highlighted)}
              opacity={dimmed ? 0.45 : 1}
            >
              <Popup maxWidth={280} minWidth={200} autoPanPadding={[24, 48]}>
                <div className="min-w-[200px] max-h-[min(50vh,320px)] overflow-y-auto">
                  <p className="text-xs font-medium text-muted-ink mb-0.5">
                    {tDiscover(`map.legend.${p.kind}`)}
                  </p>
                  <AppLink href={p.href} className={`${TYPE.cardTitle} block mb-1`}>
                    {getLocalizedName(p, locale)}
                  </AppLink>
                  <p className="text-xs text-muted-ink mb-3">{p.region}</p>
                  <div className="flex flex-col gap-2">
                    <AddToItineraryButton
                      placeId={p.id}
                      label={tCommon("addToPlan")}
                      className="text-sm min-h-[44px] px-4 py-2 w-full justify-center"
                    />
                    <AppLink
                      href={p.href}
                      className="inline-flex items-center justify-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:underline"
                    >
                      {tDiscover("map.view")}
                    </AppLink>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {showFooter ? (
        <div className="shrink-0 px-4 py-3 bg-sand/60 border-t border-sand-200/70">
          <p className="text-sm text-muted-ink">
            {tDiscover("map.footerCount", { count: places.length })}
          </p>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import type { PlanItem } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";

/**
 * Opens Maps / Waze with destination. Uses lat,lng for accuracy when available.
 */
function buildMapsUrl(place: PlanItem): string | null {
  const coords = getPlaceCoords(place);
  if (coords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  }
  const query = encodeURIComponent(`${place.name}, ${place.region}, Cyprus`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

export default function NavigateButton({
  place,
  className = "",
  label = "Navigate",
  variant = "default",
}: {
  place: PlanItem;
  className?: string;
  label?: string;
  variant?: "default" | "light";
}) {
  const url = buildMapsUrl(place);
  if (!url) return null;

  const base =
    variant === "light"
      ? "text-white border-white/50 hover:bg-white/20 focus-visible:ring-white/50"
      : "text-aegean border-aegean/30 hover:bg-aegean/10 focus-visible:ring-aegean/50";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${base} ${className}`}
      aria-label={`Navigate to ${place.name}`}
    >
      {label}
    </a>
  );
}

import { getPlaceById } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import { MAX_DAYS } from "@/lib/itinerary-share";

export type TripDatesInput = {
  start: string | null;
  end: string | null;
};

export type MapBounds = [[number, number], [number, number]];

export type PlanDayMapFocus = {
  enabled: boolean;
  planDay: number;
  placeIds: string[];
  center: { lat: number; lng: number } | null;
  bounds: MapBounds | null;
};

const SINGLE_PIN_PAD_DEG = 0.08;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function daysUntilTrip(start: string | null): number | null {
  if (!start) return null;
  const d = parseDateOnly(start);
  if (!d) return null;
  const today = new Date();
  const startDay = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((startDay - todayDay) / MS_PER_DAY);
}

/** Calendar plan day when trip is active; otherwise day 1. */
export function getPlanDayIndex(
  dates: TripDatesInput,
  activeDay: number,
  now: Date = new Date()
): number {
  const daysUntil = daysUntilTrip(dates.start);
  if (dates.start && daysUntil !== null && daysUntil <= 0) {
    const start = new Date(dates.start);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const dayIndex =
      Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (dayIndex >= 1 && dayIndex <= MAX_DAYS) return dayIndex;
  }
  return Math.min(Math.max(1, activeDay), MAX_DAYS);
}

function padSinglePinBounds(lat: number, lng: number): MapBounds {
  return [
    [lat - SINGLE_PIN_PAD_DEG, lng - SINGLE_PIN_PAD_DEG],
    [lat + SINGLE_PIN_PAD_DEG, lng + SINGLE_PIN_PAD_DEG],
  ];
}

function boundsFromCoords(coords: { lat: number; lng: number }[]): MapBounds | null {
  if (coords.length === 0) return null;
  if (coords.length === 1) return padSinglePinBounds(coords[0].lat, coords[0].lng);
  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

/** Focus map on places saved for a plan day when trip dates are set. */
export function getPlanDayMapFocus(
  days: Record<number, string[]>,
  planDay: number,
  dates: TripDatesInput
): PlanDayMapFocus {
  const empty: PlanDayMapFocus = {
    enabled: false,
    planDay,
    placeIds: [],
    center: null,
    bounds: null,
  };

  if (!dates.start) return empty;

  const ids = days[planDay] ?? [];
  if (ids.length === 0) return { ...empty, planDay };

  const coords: { lat: number; lng: number; id: string }[] = [];
  for (const id of ids) {
    const place = getPlaceById(id);
    if (!place) continue;
    const c = getPlaceCoords(place);
    if (!c) continue;
    coords.push({ ...c, id });
  }

  if (coords.length === 0) return { ...empty, planDay, placeIds: ids };

  const center = {
    lat: coords.reduce((s, c) => s + c.lat, 0) / coords.length,
    lng: coords.reduce((s, c) => s + c.lng, 0) / coords.length,
  };

  return {
    enabled: true,
    planDay,
    placeIds: coords.map((c) => c.id),
    center,
    bounds: boundsFromCoords(coords),
  };
}

/**
 * Recently viewed items tracker
 * Persists in localStorage for cross-session memory
 */

import type { PlanItem } from "@/data";

type RecentlyViewedItem = {
  id: string;
  name: string;
  type: PlanItem["type"] | string;
  region: string;
  viewedAt: string;
};

const STORAGE_KEY = "cyprus-recently-viewed";
const MAX_ITEMS = 10;

function isValidItem(v: unknown): v is RecentlyViewedItem {
  if (typeof v !== "object" || v === null) return false;
  const item = v as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.type === "string" &&
    typeof item.region === "string"
  );
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // The write path caps and shapes entries, but storage is user-editable —
    // validate and cap on read too, like the chat loader does (b74).
    return parsed.filter(isValidItem).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentlyViewed();
    
    // Remove if already exists (will be re-added at top)
    const filtered = current.filter((i) => i.id !== item.id);
    
    // Add new item at beginning
    const updated: RecentlyViewedItem[] = [
      { ...item, viewedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or disabled
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

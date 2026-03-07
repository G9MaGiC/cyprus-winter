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

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as RecentlyViewedItem[];
    return Array.isArray(parsed) ? parsed : [];
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

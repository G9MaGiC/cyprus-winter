/**
 * Deterministic daily rotator for content liveness.
 * Same date + same items = same pick (SSG-safe, works client-side).
 */
export function getDailySeed(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

/** djb2-style string hash for deterministic indexing with good distribution. */
function djb2Hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) + h) + c;
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Pick one item from an array by date. Same seed + same array = same result.
 */
export function pickDaily<T>(items: T[], seed?: string): T {
  if (items.length === 0) throw new Error("pickDaily: items array is empty");
  const s = seed ?? getDailySeed();
  const hash = djb2Hash(s);
  const idx = hash % items.length;
  return items[idx];
}

/**
 * Pick one item by date with a custom seed suffix (e.g. "place" vs "tip").
 */
export function pickDailyWithKey<T>(items: T[], key: string, seed?: string): T {
  if (items.length === 0) throw new Error("pickDailyWithKey: items array is empty");
  const s = `${seed ?? getDailySeed()}-${key}`;
  const hash = djb2Hash(s);
  const idx = hash % items.length;
  return items[idx];
}

/**
 * Safe variant: returns null when items array is empty.
 */
export function pickDailySafe<T>(items: T[], key?: string, seed?: string): T | null {
  if (items.length === 0) return null;
  const s = key ? `${seed ?? getDailySeed()}-${key}` : (seed ?? getDailySeed());
  const hash = djb2Hash(s);
  const idx = hash % items.length;
  return items[idx];
}

/**
 * Pick one item with boosted probability for promoted IDs.
 * Promoted items are duplicated in the pool (boostWeight times) before picking.
 * Use for Place of Day etc. when certain places should appear more often.
 */
export function pickDailySafeWithBoost<T extends { id: string }>(
  items: T[],
  promotedIds: string[],
  key: string,
  boostWeight = 5,
  seed?: string
): T | null {
  if (items.length === 0) return null;
  const idSet = new Set(promotedIds);
  const promoted = items.filter((i) => idSet.has(i.id));
  const extra = promoted.flatMap((p) => Array(boostWeight - 1).fill(p));
  const pool = [...items, ...extra];
  const s = `${seed ?? getDailySeed()}-${key}`;
  const hash = djb2Hash(s);
  const idx = hash % pool.length;
  return pool[idx];
}

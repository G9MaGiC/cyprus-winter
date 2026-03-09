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

/** Type for items with a type/category field */
export type WithType = { id: string; type?: string };

/**
 * Pick multiple items with type diversity. Primary pick from one type; secondary
 * picks from other types when possible. Uses promoted boost. Deterministic.
 */
export function pickDailyMultipleWithTypeDiversity<T extends WithType>(
  items: T[],
  promotedIds: string[],
  key: string,
  count: number,
  boostWeight = 5,
  seed?: string
): T[] {
  if (items.length === 0 || count <= 0) return [];
  const baseSeed = seed ?? getDailySeed();
  const idSet = new Set(promotedIds);
  const promoted = items.filter((i) => idSet.has(i.id));
  const extra = promoted.flatMap((p) => Array(boostWeight - 1).fill(p));
  const pool = [...items, ...extra];

  const byType = new Map<string, T[]>();
  for (const item of pool) {
    const t = item.type ?? "other";
    let arr = byType.get(t);
    if (!arr) {
      arr = [];
      byType.set(t, arr);
    }
    arr.push(item);
  }
  const types = Array.from(byType.keys());

  const result: T[] = [];
  const seenIds = new Set<string>();
  const usedTypes = new Set<string>();

  for (let i = 0; i < count && result.length < count; i++) {
    const slotSeed = `${baseSeed}-${key}-${i}`;
    const hash = djb2Hash(slotSeed);

    let candidates: T[];
    if (i === 0) {
      const typeIdx = hash % types.length;
      candidates = byType.get(types[typeIdx]) ?? pool;
    } else {
      const available = types.filter((t) => !usedTypes.has(t));
      const typeList = available.length > 0 ? available : types;
      const typeIdx = hash % typeList.length;
      candidates = byType.get(typeList[typeIdx]) ?? pool;
    }

    const available = candidates.filter((c) => !seenIds.has(c.id));
    const pickPool = available.length > 0 ? available : pool.filter((c) => !seenIds.has(c.id));
    if (pickPool.length === 0) break;

    const idx = (hash >>> 0) % pickPool.length;
    const picked = pickPool[idx];
    result.push(picked);
    seenIds.add(picked.id);
    if (picked.type) usedTypes.add(picked.type);
  }

  return result;
}

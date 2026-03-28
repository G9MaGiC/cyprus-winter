# AI Concierge Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Cyprus Winter AI assistant from a prompt-based Q&A guide into a tool-using RAG concierge with server-side tools, structured JSON responses, and action-oriented chat UI.

**Architecture:** Retrieve-then-generate pattern. The server classifies user intent, executes tool functions against in-memory static data, injects results into LLM context, and streams prose + JSON metadata to the client. The client renders action buttons, place cards, and follow-up chips from the metadata.

**Tech Stack:** Next.js 16 (App Router), TypeScript, OpenAI-compatible LLM clients (multi-provider), SSE streaming, Zod validation, React 19, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-03-23-ai-concierge-redesign-design.md`

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `src/lib/concierge/types.ts` | Shared types: Intent, ToolResult, ConciergeContext, ResponseMetadata, ActionType, Card, FollowUp |
| `src/lib/concierge/intents.ts` | Deterministic intent classifier — maps user message + context to intent(s) |
| `src/lib/concierge/tools/search-places.ts` | In-memory place search with filtering and ranking |
| `src/lib/concierge/tools/search-trails.ts` | Trail search with difficulty/region/season filtering |
| `src/lib/concierge/tools/search-events.ts` | Event search by month/region |
| `src/lib/concierge/tools/get-weather.ts` | Static monthly weather lookup |
| `src/lib/concierge/tools/get-nearby-places.ts` | Haversine distance filtering |
| `src/lib/concierge/tools/get-transport-options.ts` | Airport transport data lookup |
| `src/lib/concierge/tools/build-itinerary.ts` | Day plan builder using places + time constraints |
| `src/lib/concierge/ranking.ts` | MVP scoring formula (keyword, distance, season, category, editorial) |
| `src/lib/concierge/orchestrator.ts` | Intent → tools → context assembly → prompt construction |
| `src/lib/concierge/prompts/system-assistant.ts` | System prompt (identity, behavior, tone) |
| `src/lib/concierge/prompts/developer-tool-policy.ts` | Tool use constraints and output format instructions |
| `src/lib/concierge/response-parser.ts` | Server-side: split `---ACTIONS---` delimiter, parse JSON suffix |
| `src/components/ai/ActionButtons.tsx` | Renders action buttons from metadata |
| `src/components/ai/PlaceCards.tsx` | Renders place cards from metadata |
| `src/components/ai/FollowUpChips.tsx` | Renders follow-up suggestion chips |
| `src/lib/concierge/__tests__/intents.test.ts` | Intent classifier tests |
| `src/lib/concierge/__tests__/search-places.test.ts` | Place search tests |
| `src/lib/concierge/__tests__/search-trails.test.ts` | Trail search tests |
| `src/lib/concierge/__tests__/ranking.test.ts` | Ranking formula tests |
| `src/lib/concierge/__tests__/orchestrator.test.ts` | Orchestrator integration tests |
| `src/lib/concierge/__tests__/response-parser.test.ts` | Response parser tests |
| `src/lib/concierge/__tests__/capable-provider.test.ts` | Provider capability tests |
| `src/lib/concierge/__tests__/build-itinerary.test.ts` | Itinerary builder tests |
| `src/lib/concierge/__tests__/integration.test.ts` | Full flow integration tests |
| `src/components/ai/__tests__/chat-ui.test.tsx` | UI component render tests |

### Modified files

| File | What changes |
|------|-------------|
| `src/lib/chat-schema.ts` | Add `currentLocation`, `tripDates`, `tripStage` to context schema |
| `src/app/api/chat/route.ts` | Rewrite to use orchestrator for capable models, keep legacy path for weak models |
| `src/components/ai/hooks/useAIChat.ts` | Handle `metadata` SSE events, expose metadata state |
| `src/components/ai/AIChatMessages.tsx` | Render ActionButtons, PlaceCards, FollowUpChips after assistant messages |
| `src/data/attractions.ts` | Add `seasonTags`, `indoorOutdoor`, `budgetLevel`, `editorialPriority` fields to type + data |
| `src/data/wineries.ts` | Add `seasonTags`, `indoorOutdoor`, `budgetLevel`, `editorialPriority` fields to type + data |
| `src/data/trails.ts` | Add `editorialPriority` field to type + data |
| `src/data/restaurants.ts` | Add `seasonTags`, `indoorOutdoor`, `budgetLevel`, `editorialPriority` fields to type + data |
| `src/data/events.ts` | Add `editorialPriority` field to type + data |

---

## Task 1: Concierge Types

**Files:**
- Create: `src/lib/concierge/types.ts`
- Test: `src/lib/concierge/__tests__/types.test.ts`

- [x] **Step 1: Write the type definitions**

```typescript
// src/lib/concierge/types.ts

/** Intents the orchestrator can classify */
export type Intent =
  | "plan_trip"
  | "plan_today"
  | "discover"
  | "weather_adapted"
  | "nearby"
  | "booking"
  | "trails_outdoor"
  | "airport_arrival"
  | "search_compare"
  | "account_navigation"
  | "general";

/** Context payload assembled server-side each turn */
export type ConciergeContext = {
  locale: string;
  path?: string;
  lastPlace?: string;
  itinerary?: { day: number; placeIds: string[] }[];
  currentLocation?: { lat: number; lng: number };
  tripDates?: { start: string; end: string };
  tripStage?: "pre_trip" | "during_trip" | "post_trip";
  weatherSummary?: string;
  season: "winter";
};

/** Result from any tool execution */
export type ToolResult = {
  tool: string;
  data: unknown;
};

/** A place card in the response */
export type PlaceCard = {
  type: "place" | "trail" | "event" | "winery";
  id: string;
  title: string;
  reason: string;
};

/** An action button in the response */
export type ResponseAction = {
  type: "open_place" | "save_to_plan" | "show_on_map" | "view_events" | "book_now" | "build_day_plan";
  label: string;
  payload?: Record<string, unknown>;
};

/** Structured metadata parsed from LLM response suffix */
export type ResponseMetadata = {
  cards?: PlaceCard[];
  actions?: ResponseAction[];
  followUps?: string[];
};

/** Full orchestrator output before LLM call */
export type OrchestratorResult = {
  intents: Intent[];
  toolResults: ToolResult[];
  systemPrompt: string;
  contextBlock: string;
};
```

- [x] **Step 2: Write a smoke test**

```typescript
// src/lib/concierge/__tests__/types.test.ts
import type { Intent, ConciergeContext, ResponseMetadata } from "../types";

describe("concierge types", () => {
  it("allows valid intent values", () => {
    const intent: Intent = "discover";
    expect(intent).toBe("discover");
  });

  it("allows valid context shape", () => {
    const ctx: ConciergeContext = {
      locale: "en",
      season: "winter",
      path: "/trails",
    };
    expect(ctx.season).toBe("winter");
  });

  it("allows valid response metadata shape", () => {
    const meta: ResponseMetadata = {
      cards: [{ type: "place", id: "omodos", title: "Omodos", reason: "quiet village" }],
      actions: [{ type: "open_place", label: "See Omodos" }],
      followUps: ["Add a winery stop"],
    };
    expect(meta.cards).toHaveLength(1);
  });
});
```

- [x] **Step 3: Run test to verify it passes**

Run: `npx vitest run src/lib/concierge/__tests__/types.test.ts`
Expected: PASS (type-only tests compile and pass)

- [x] **Step 4: Commit**

```bash
git add src/lib/concierge/types.ts src/lib/concierge/__tests__/types.test.ts
git commit -m "feat(concierge): add shared type definitions for concierge architecture"
```

---

## Task 2: Data Enrichment

Add `seasonTags`, `indoorOutdoor`, `budgetLevel`, and `editorialPriority` fields to static data types and populate them.

**Files:**
- Modify: `src/data/attractions.ts` (type + data entries)
- Modify: `src/data/wineries.ts` (type + data entries)
- Modify: `src/data/trails.ts` (type + data entries)
- Modify: `src/data/events.ts` (type + data entries)

- [x] **Step 1: Add fields to `Attraction` type**

Add after the `longitude` field in `src/data/attractions.ts`:

```typescript
  /** Season suitability tags */
  seasonTags?: ("winter" | "spring" | "summer" | "autumn")[];
  /** Indoor, outdoor, or mixed */
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  /** Budget level: free, low, mid, high */
  budgetLevel?: "free" | "low" | "mid" | "high";
  /** Editorial priority for ranking (1 = highest) */
  editorialPriority?: number;
```

- [x] **Step 2: Populate enrichment fields on all attraction entries**

For each attraction, add the 4 new fields based on the attraction's characteristics. Examples:
- Beaches: `seasonTags: ["winter", "spring", "autumn"]`, `indoorOutdoor: "outdoor"`, `budgetLevel: "free"`, `editorialPriority: 3`
- Ancient sites: `seasonTags: ["winter", "spring", "autumn"]`, `indoorOutdoor: "outdoor"`, `budgetLevel: "low"`, `editorialPriority: 2`
- Villages: `seasonTags: ["winter", "spring", "autumn"]`, `indoorOutdoor: "mixed"`, `budgetLevel: "free"`, `editorialPriority: 2`
- Monasteries: `seasonTags: ["winter", "spring", "autumn"]`, `indoorOutdoor: "mixed"`, `budgetLevel: "free"`, `editorialPriority: 3`

Use judgment for each individual entry. Key villages like Omodos and Lefkara get `editorialPriority: 1`.

- [x] **Step 3: Add fields to `Winery` type and populate**

Add to `Winery` type in `src/data/wineries.ts`:

```typescript
  seasonTags?: ("winter" | "spring" | "summer" | "autumn")[];
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  budgetLevel?: "free" | "low" | "mid" | "high";
  editorialPriority?: number;
```

Most wineries: `seasonTags: ["winter"]`, `indoorOutdoor: "mixed"`, `budgetLevel: "mid"`, `editorialPriority` varies (Tsiakkas = 1, lesser-known = 3).

- [x] **Step 4: Add `editorialPriority` to `Trail` type and populate**

Trails already have `bestSeason` which serves as `seasonTags`. Add only:

```typescript
  editorialPriority?: number;
```

Artemis = 1, Atalante = 1, Caledonia = 1, lesser trails = 2–3.

- [x] **Step 5: Add enrichment fields to `Restaurant` type and populate**

Add to `Restaurant` type in `src/data/restaurants.ts` after the `longitude` field:

```typescript
  seasonTags?: ("winter" | "spring" | "summer" | "autumn")[];
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  budgetLevel?: "free" | "low" | "mid" | "high";
  editorialPriority?: number;
```

Most restaurants: `seasonTags: ["winter"]`, `indoorOutdoor: "indoor"`, `budgetLevel` mapped from `priceRange` (€ → "low", €€ → "mid", €€€ → "high"), `editorialPriority` varies.

- [x] **Step 6: Add `editorialPriority` to `WinterEvent` type and populate**

```typescript
  editorialPriority?: number;
```

Limassol Carnival = 1, Commandaria Festival = 1, others = 2–3.

- [x] **Step 7: Verify the app still builds**

Run: `npx next build`
Expected: Build succeeds with no type errors.

- [x] **Step 8: Commit**

```bash
git add src/data/attractions.ts src/data/wineries.ts src/data/trails.ts src/data/events.ts src/data/restaurants.ts
git commit -m "feat(data): add season, indoor/outdoor, budget, and editorial priority metadata"
```

---

## Task 3: Ranking Engine

**Files:**
- Create: `src/lib/concierge/ranking.ts`
- Test: `src/lib/concierge/__tests__/ranking.test.ts`

- [x] **Step 1: Write the failing test**

```typescript
// src/lib/concierge/__tests__/ranking.test.ts
import { rankPlaces, type RankablePlace } from "../ranking";

describe("rankPlaces", () => {
  const places: RankablePlace[] = [
    {
      id: "omodos",
      name: "Omodos",
      region: "Limassol",
      description: "Traditional wine village",
      seasonTags: ["winter"],
      editorialPriority: 1,
      latitude: 34.85,
      longitude: 32.81,
    },
    {
      id: "nissi-beach",
      name: "Nissi Beach",
      region: "Ayia Napa",
      description: "White sand beach",
      seasonTags: ["summer"],
      editorialPriority: 3,
      latitude: 34.987,
      longitude: 34.001,
    },
  ];

  it("ranks winter-suitable places higher in winter", () => {
    const ranked = rankPlaces(places, { query: "village", season: "winter" });
    expect(ranked[0].id).toBe("omodos");
  });

  it("ranks by keyword match", () => {
    const ranked = rankPlaces(places, { query: "beach" });
    expect(ranked[0].id).toBe("nissi-beach");
  });

  it("ranks by distance when location provided", () => {
    // Location near Omodos (Limassol)
    const ranked = rankPlaces(places, {
      query: "",
      userLocation: { lat: 34.68, lng: 33.04 },
    });
    expect(ranked[0].id).toBe("omodos");
  });

  it("returns at most limit results", () => {
    const ranked = rankPlaces(places, { query: "", limit: 1 });
    expect(ranked).toHaveLength(1);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/concierge/__tests__/ranking.test.ts`
Expected: FAIL — module not found

- [x] **Step 3: Implement the ranking engine**

```typescript
// src/lib/concierge/ranking.ts

export type RankablePlace = {
  id: string;
  name: string;
  region: string;
  description: string;
  seasonTags?: string[];
  editorialPriority?: number;
  latitude?: number;
  longitude?: number;
  type?: string;
  highlights?: string[];
  bestFor?: string[];
};

export type RankingOptions = {
  query?: string;
  season?: string;
  category?: string;
  userLocation?: { lat: number; lng: number };
  limit?: number;
};

function keywordScore(place: RankablePlace, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const fields = [
    place.name,
    place.description,
    place.region,
    place.type ?? "",
    ...(place.highlights ?? []),
    ...(place.bestFor ?? []),
  ].join(" ").toLowerCase();

  const words = q.split(/\s+/).filter(Boolean);
  const matched = words.filter((w) => fields.includes(w)).length;
  return words.length > 0 ? matched / words.length : 0;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceScore(place: RankablePlace, userLocation?: { lat: number; lng: number }): number {
  if (!userLocation || place.latitude == null || place.longitude == null) return 0;
  const km = haversineKm(userLocation.lat, userLocation.lng, place.latitude, place.longitude);
  // Normalize: 0km = 1.0, 100km+ = 0.0
  return Math.max(0, 1 - km / 100);
}

function seasonScore(place: RankablePlace, season?: string): number {
  if (!season || !place.seasonTags?.length) return 0.5;
  return place.seasonTags.includes(season) ? 1 : 0;
}

function categoryScore(place: RankablePlace, category?: string): number {
  if (!category) return 0;
  const c = category.toLowerCase();
  const type = (place.type ?? "").toLowerCase();
  const tags = [...(place.highlights ?? []), ...(place.bestFor ?? [])].join(" ").toLowerCase();
  if (type === c) return 1;
  if (tags.includes(c)) return 0.7;
  return 0;
}

function editorialScore(place: RankablePlace): number {
  const p = place.editorialPriority ?? 3;
  // Priority 1 → 1.0, 2 → 0.66, 3 → 0.33
  return Math.max(0, 1 - (p - 1) / 3);
}

export function rankPlaces(places: RankablePlace[], options: RankingOptions = {}): RankablePlace[] {
  const { query = "", season, category, userLocation, limit = 5 } = options;

  const scored = places.map((place) => {
    const kw = keywordScore(place, query);
    const dist = distanceScore(place, userLocation);
    const sea = seasonScore(place, season);
    const cat = categoryScore(place, category);
    const ed = editorialScore(place);

    // MVP weights from spec
    const hasLocation = userLocation != null;
    const score = hasLocation
      ? 0.35 * kw + 0.25 * dist + 0.15 * sea + 0.15 * cat + 0.10 * ed
      : 0.40 * kw + 0.20 * sea + 0.20 * cat + 0.20 * ed;

    return { place, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.place);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/concierge/__tests__/ranking.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/lib/concierge/ranking.ts src/lib/concierge/__tests__/ranking.test.ts
git commit -m "feat(concierge): add MVP ranking engine with keyword, distance, season scoring"
```

---

## Task 4: Intent Classifier

**Files:**
- Create: `src/lib/concierge/intents.ts`
- Test: `src/lib/concierge/__tests__/intents.test.ts`

- [x] **Step 1: Write the failing test**

```typescript
// src/lib/concierge/__tests__/intents.test.ts
import { classifyIntent } from "../intents";
import type { ConciergeContext } from "../types";

const baseCtx: ConciergeContext = { locale: "en", season: "winter" };

describe("classifyIntent", () => {
  it("classifies 'plan 3 days in Cyprus' as plan_trip", () => {
    expect(classifyIntent("Plan 3 days in Cyprus", baseCtx)).toContain("plan_trip");
  });

  it("classifies 'what should I do today' as plan_today", () => {
    expect(classifyIntent("What should I do today?", baseCtx)).toContain("plan_today");
  });

  it("classifies 'best villages near Paphos' as discover", () => {
    expect(classifyIntent("Best villages near Paphos", baseCtx)).toContain("discover");
  });

  it("classifies 'it's raining' as weather_adapted", () => {
    expect(classifyIntent("It's raining, what can we do?", baseCtx)).toContain("weather_adapted");
  });

  it("classifies 'what's near me' as nearby", () => {
    expect(classifyIntent("What's near me?", baseCtx)).toContain("nearby");
  });

  it("classifies 'book a winery' as booking", () => {
    expect(classifyIntent("Book a winery for tomorrow", baseCtx)).toContain("booking");
  });

  it("classifies 'easy winter hike' as trails_outdoor", () => {
    expect(classifyIntent("Easy winter hike", baseCtx)).toContain("trails_outdoor");
  });

  it("classifies 'I just landed' as airport_arrival", () => {
    expect(classifyIntent("I just landed in Larnaca", baseCtx)).toContain("airport_arrival");
  });

  it("classifies 'Ayia Napa or Paphos?' as search_compare", () => {
    expect(classifyIntent("Ayia Napa or Paphos in winter?", baseCtx)).toContain("search_compare");
  });

  it("classifies 'where do I save this' as account_navigation", () => {
    expect(classifyIntent("Where do I save this?", baseCtx)).toContain("account_navigation");
  });

  it("falls back to general for unrecognized input", () => {
    expect(classifyIntent("Hello", baseCtx)).toContain("general");
  });

  it("can return multiple intents", () => {
    const intents = classifyIntent("Plan a rainy day in Limassol", baseCtx);
    expect(intents).toContain("plan_today");
    expect(intents).toContain("weather_adapted");
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/concierge/__tests__/intents.test.ts`
Expected: FAIL — module not found

- [x] **Step 3: Implement the intent classifier**

```typescript
// src/lib/concierge/intents.ts
import type { Intent, ConciergeContext } from "./types";

type IntentPattern = {
  intent: Intent;
  patterns: RegExp[];
};

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: "airport_arrival",
    patterns: [
      /\b(land|landed|arriving|arrival|airport|larnaca airport|paphos airport|LCA|PFO)\b/i,
      /\bjust (got here|arrived|landed)\b/i,
      /\bhow (do I |to )?(get to|reach)\b/i,
    ],
  },
  {
    intent: "plan_trip",
    patterns: [
      /\bplan\b.*\b(\d+)\s*(day|week)/i,
      /\bitinerary\b/i,
      /\bmake me a .*(plan|itinerary|route)\b/i,
      /\b(multi[- ]?day|full trip)\b/i,
    ],
  },
  {
    intent: "plan_today",
    patterns: [
      /\btoday\b/i,
      /\bthis (morning|afternoon|evening)\b/i,
      /\bwhat (should|can) (I|we) do\b/i,
      /\bwhat now\b/i,
      /\bplan (my |a )?day\b/i,
    ],
  },
  {
    intent: "weather_adapted",
    patterns: [
      /\b(rain|rainy|raining|windy|wind|storm|cold|hot|cloudy|snow|snowing)\b/i,
      /\bweather\b/i,
      /\btoo (windy|cold|hot)\b/i,
    ],
  },
  {
    intent: "nearby",
    patterns: [
      /\bnear (me|here|my|us)\b/i,
      /\bnearby\b/i,
      /\bwithin \d+ (min|minute|km|kilometer)\b/i,
      /\bclose to (me|here|where I am)\b/i,
    ],
  },
  {
    intent: "booking",
    patterns: [
      /\b(book|reserve|reservation|booking)\b/i,
      /\bfind a (guide|tour)\b/i,
      /\bavailability\b/i,
    ],
  },
  {
    intent: "trails_outdoor",
    patterns: [
      /\b(trail|hike|hiking|walk|trek|trekking)\b/i,
      /\b(outdoor|nature walk|mountain)\b/i,
      /\b(artemis|atalante|caledonia|persephone|adonis) trail\b/i,
    ],
  },
  {
    intent: "discover",
    patterns: [
      /\b(best|top|hidden|secret|recommend)\b.*\b(village|beach|winery|monastery|ruin|site|place)\b/i,
      /\b(village|beach|winery|monastery|ancient site)\b.*\b(near|in|around)\b/i,
      /\bwhat (is|are) (the )?best\b/i,
      /\bshow me\b/i,
    ],
  },
  {
    intent: "search_compare",
    patterns: [
      /\bor\b.*\b(in winter|for|better|vs)\b/i,
      /\bcompare\b/i,
      /\bwhich (is|are) (better|best)\b/i,
      /\b(vs|versus)\b/i,
    ],
  },
  {
    intent: "account_navigation",
    patterns: [
      /\b(save|saved|account|login|sign|password|reset)\b/i,
      /\bhow (do I |to )?(find|use|navigate)\b/i,
    ],
  },
];

export function classifyIntent(message: string, _context: ConciergeContext): Intent[] {
  const matched: Intent[] = [];

  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(message))) {
      matched.push(intent);
    }
  }

  if (matched.length === 0) {
    matched.push("general");
  }

  return matched;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/concierge/__tests__/intents.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/lib/concierge/intents.ts src/lib/concierge/__tests__/intents.test.ts
git commit -m "feat(concierge): add deterministic intent classifier with pattern matching"
```

---

## Task 5: Tool Functions — search_places

**Files:**
- Create: `src/lib/concierge/tools/search-places.ts`
- Test: `src/lib/concierge/__tests__/search-places.test.ts`

- [x] **Step 1: Write the failing test**

```typescript
// src/lib/concierge/__tests__/search-places.test.ts
import { searchPlaces } from "../tools/search-places";

describe("searchPlaces", () => {
  it("returns places matching a query", () => {
    const results = searchPlaces({ query: "Omodos" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.id === "omodos")).toBe(true);
  });

  it("filters by region", () => {
    const results = searchPlaces({ query: "", region: "Paphos" });
    expect(results.every((p) => p.region.includes("Paphos"))).toBe(true);
  });

  it("filters by category", () => {
    const results = searchPlaces({ query: "", categories: ["beach"] });
    expect(results.every((p) => p.type === "beach")).toBe(true);
  });

  it("respects limit", () => {
    const results = searchPlaces({ query: "", limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("ranks by season in winter", () => {
    const results = searchPlaces({ query: "village", season: "winter", limit: 5 });
    expect(results.length).toBeGreaterThan(0);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/concierge/__tests__/search-places.test.ts`
Expected: FAIL — module not found

- [x] **Step 3: Implement search_places**

```typescript
// src/lib/concierge/tools/search-places.ts
import { beaches, ancientSites, villages, monasteries, natureSites } from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { rankPlaces, type RankablePlace } from "../ranking";

export type SearchPlacesInput = {
  query?: string;
  region?: string;
  categories?: string[];
  season?: string;
  userLocation?: { lat: number; lng: number };
  limit?: number;
};

const ALL_PLACES: RankablePlace[] = [
  ...beaches.map((p) => ({ ...p, type: p.type })),
  ...ancientSites.map((p) => ({ ...p, type: p.type })),
  ...villages.map((p) => ({ ...p, type: p.type })),
  ...monasteries.map((p) => ({ ...p, type: p.type })),
  ...natureSites.map((p) => ({ ...p, type: p.type })),
  ...wineries.map((w) => ({ ...w, type: "winery" as const })),
  ...restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    region: r.region,
    description: r.description,
    type: "restaurant" as const,
    highlights: r.highlights ?? [],
    bestFor: r.bestFor ?? [],
    latitude: r.latitude,
    longitude: r.longitude,
    seasonTags: r.seasonTags,
    editorialPriority: r.editorialPriority,
  })),
];

export function searchPlaces(input: SearchPlacesInput) {
  let candidates = ALL_PLACES;

  if (input.region) {
    const r = input.region.toLowerCase();
    candidates = candidates.filter((p) => p.region.toLowerCase().includes(r));
  }

  if (input.categories?.length) {
    const cats = input.categories.map((c) => c.toLowerCase());
    candidates = candidates.filter((p) => {
      const t = (p.type ?? "").toLowerCase();
      return cats.includes(t);
    });
  }

  return rankPlaces(candidates, {
    query: input.query,
    season: input.season,
    userLocation: input.userLocation,
    limit: input.limit ?? 5,
  });
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/concierge/__tests__/search-places.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/lib/concierge/tools/search-places.ts src/lib/concierge/__tests__/search-places.test.ts
git commit -m "feat(concierge): add search_places tool with in-memory filtering and ranking"
```

---

## Task 6: Tool Functions — search_trails, search_events, get_weather, get_nearby_places, get_transport_options

**Files:**
- Create: `src/lib/concierge/tools/search-trails.ts`
- Create: `src/lib/concierge/tools/search-events.ts`
- Create: `src/lib/concierge/tools/get-weather.ts`
- Create: `src/lib/concierge/tools/get-nearby-places.ts`
- Create: `src/lib/concierge/tools/get-transport-options.ts`
- Test: `src/lib/concierge/__tests__/search-trails.test.ts`
- Test: `src/lib/concierge/__tests__/tools.test.ts`

- [x] **Step 1: Write failing tests for search_trails**

```typescript
// src/lib/concierge/__tests__/search-trails.test.ts
import { searchTrails } from "../tools/search-trails";

describe("searchTrails", () => {
  it("returns trails matching a query", () => {
    const results = searchTrails({ query: "Artemis" });
    expect(results.some((t) => t.id === "artemis")).toBe(true);
  });

  it("filters by difficulty", () => {
    const results = searchTrails({ difficulty: "easy" });
    expect(results.every((t) => t.difficulty === "easy")).toBe(true);
  });

  it("filters by region", () => {
    const results = searchTrails({ region: "Troodos" });
    expect(results.every((t) => t.region === "Troodos")).toBe(true);
  });

  it("prioritizes winter-suitable trails when season is winter", () => {
    const results = searchTrails({ query: "", season: "winter", limit: 3 });
    expect(results.length).toBeGreaterThan(0);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/concierge/__tests__/search-trails.test.ts`
Expected: FAIL

- [x] **Step 3: Implement search_trails**

```typescript
// src/lib/concierge/tools/search-trails.ts
import { trails } from "@/data/trails";

export type SearchTrailsInput = {
  query?: string;
  region?: string;
  difficulty?: "easy" | "moderate" | "hard" | "expert";
  season?: string;
  limit?: number;
};

export function searchTrails(input: SearchTrailsInput) {
  let candidates = [...trails];

  if (input.region) {
    candidates = candidates.filter((t) => t.region.toLowerCase().includes(input.region!.toLowerCase()));
  }
  if (input.difficulty) {
    candidates = candidates.filter((t) => t.difficulty === input.difficulty);
  }

  // Score and sort
  const scored = candidates.map((t) => {
    let score = 0;
    const q = (input.query ?? "").toLowerCase();

    // Keyword match
    if (q && (t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) {
      score += 0.4;
    }

    // Season fit
    if (input.season && t.bestSeason.includes(input.season as "winter")) {
      score += 0.3;
    }

    // Editorial priority
    const ep = t.editorialPriority ?? 3;
    score += 0.2 * Math.max(0, 1 - (ep - 1) / 3);

    // Prefer easier trails for general queries
    if (!input.difficulty) {
      score += 0.1 * (t.difficulty === "easy" ? 1 : t.difficulty === "moderate" ? 0.7 : 0.3);
    }

    return { trail: t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, input.limit ?? 5).map((s) => s.trail);
}
```

- [x] **Step 4: Run search_trails test**

Run: `npx vitest run src/lib/concierge/__tests__/search-trails.test.ts`
Expected: PASS

- [x] **Step 5: Write failing tests for remaining tools**

```typescript
// src/lib/concierge/__tests__/tools.test.ts
import { searchEvents } from "../tools/search-events";
import { getWeather } from "../tools/get-weather";
import { getNearbyPlaces } from "../tools/get-nearby-places";
import { getTransportOptions } from "../tools/get-transport-options";

describe("searchEvents", () => {
  it("returns events for a given month", () => {
    const results = searchEvents({ month: "Dec" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.month === "Dec")).toBe(true);
  });

  it("filters by region", () => {
    const results = searchEvents({ region: "Limassol" });
    expect(results.every((e) => e.region.includes("Limassol"))).toBe(true);
  });
});

describe("getWeather", () => {
  it("returns weather for a valid month", () => {
    const result = getWeather({ month: "January" });
    expect(result).toBeDefined();
    expect(result!.month).toBe("January");
    expect(result!.coastMinC).toBe(8);
  });

  it("returns undefined for invalid month", () => {
    expect(getWeather({ month: "July" })).toBeUndefined();
  });
});

describe("getNearbyPlaces", () => {
  it("returns places within radius of a location", () => {
    // Limassol center
    const results = getNearbyPlaces({ lat: 34.68, lng: 33.04, radiusKm: 30 });
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty array for remote location", () => {
    const results = getNearbyPlaces({ lat: 0, lng: 0, radiusKm: 10 });
    expect(results).toHaveLength(0);
  });
});

describe("getTransportOptions", () => {
  it("returns transport for LCA", () => {
    const result = getTransportOptions({ airportCode: "LCA" });
    expect(result).toBeDefined();
    expect(result!.transport.length).toBeGreaterThan(0);
  });

  it("returns transport for PFO", () => {
    const result = getTransportOptions({ airportCode: "PFO" });
    expect(result).toBeDefined();
  });

  it("returns undefined for unknown airport", () => {
    expect(getTransportOptions({ airportCode: "XXX" })).toBeUndefined();
  });
});
```

- [x] **Step 6: Run tests to verify they fail**

Run: `npx vitest run src/lib/concierge/__tests__/tools.test.ts`
Expected: FAIL

- [x] **Step 7: Implement search_events**

```typescript
// src/lib/concierge/tools/search-events.ts
import { winterEvents } from "@/data/events";

export type SearchEventsInput = {
  month?: string;
  region?: string;
  type?: string;
  limit?: number;
};

export function searchEvents(input: SearchEventsInput) {
  let candidates = [...winterEvents];

  if (input.month) {
    candidates = candidates.filter((e) => e.month === input.month);
  }
  if (input.region) {
    const r = input.region.toLowerCase();
    candidates = candidates.filter((e) => e.region.toLowerCase().includes(r));
  }
  if (input.type) {
    candidates = candidates.filter((e) => e.type === input.type);
  }

  // Sort by editorial priority
  candidates.sort((a, b) => (a.editorialPriority ?? 3) - (b.editorialPriority ?? 3));

  return candidates.slice(0, input.limit ?? 5);
}
```

- [x] **Step 8: Implement get_weather**

```typescript
// src/lib/concierge/tools/get-weather.ts
import { weatherByMonth } from "@/data/weather";

export type GetWeatherInput = {
  month?: string;
};

export function getWeather(input: GetWeatherInput) {
  if (!input.month) return undefined;
  return weatherByMonth.find(
    (w) => w.month.toLowerCase() === input.month!.toLowerCase()
  );
}
```

- [x] **Step 9: Implement get_nearby_places**

```typescript
// src/lib/concierge/tools/get-nearby-places.ts
import { beaches, ancientSites, villages, monasteries, natureSites } from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { trails } from "@/data/trails";

type PlaceWithCoords = {
  id: string;
  name: string;
  region: string;
  type: string;
  latitude: number;
  longitude: number;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ALL_COORDS: PlaceWithCoords[] = [
  ...[...beaches, ...ancientSites, ...villages, ...monasteries, ...natureSites]
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ id: p.id, name: p.name, region: p.region, type: p.type, latitude: p.latitude!, longitude: p.longitude! })),
  ...wineries
    .filter((w) => w.latitude != null && w.longitude != null)
    .map((w) => ({ id: w.id, name: w.name, region: w.region, type: "winery", latitude: w.latitude!, longitude: w.longitude! })),
  ...trails
    .filter((t) => t.trailheadCoords != null)
    .map((t) => ({ id: t.id, name: t.name, region: t.region, type: "trail", latitude: t.trailheadCoords!.lat, longitude: t.trailheadCoords!.lng })),
];

export type GetNearbyInput = {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
};

export function getNearbyPlaces(input: GetNearbyInput) {
  const { lat, lng, radiusKm = 30, limit = 10 } = input;

  const withDist = ALL_COORDS.map((p) => ({
    ...p,
    distanceKm: haversineKm(lat, lng, p.latitude, p.longitude),
  }));

  return withDist
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
```

- [x] **Step 10: Implement get_transport_options**

```typescript
// src/lib/concierge/tools/get-transport-options.ts
import { airports } from "@/data/airport";

export type GetTransportInput = {
  airportCode: string;
};

export function getTransportOptions(input: GetTransportInput) {
  return airports.find(
    (a) => a.code.toUpperCase() === input.airportCode.toUpperCase()
  );
}
```

- [x] **Step 11: Run all tool tests**

Run: `npx vitest run src/lib/concierge/__tests__/tools.test.ts`
Expected: PASS

- [x] **Step 12: Commit**

```bash
git add src/lib/concierge/tools/ src/lib/concierge/__tests__/search-trails.test.ts src/lib/concierge/__tests__/tools.test.ts
git commit -m "feat(concierge): add search_trails, search_events, get_weather, get_nearby, get_transport tools"
```

---

## Task 7: build_itinerary Tool

**Files:**
- Create: `src/lib/concierge/tools/build-itinerary.ts`
- Test: `src/lib/concierge/__tests__/build-itinerary.test.ts`

- [x] **Step 1: Write the failing test**

```typescript
// src/lib/concierge/__tests__/build-itinerary.test.ts
import { buildItinerary } from "../tools/build-itinerary";

describe("buildItinerary", () => {
  it("builds a 1-day plan for a region", () => {
    const result = buildItinerary({ region: "Limassol", days: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].slots.length).toBeGreaterThan(0);
  });

  it("builds a multi-day plan", () => {
    const result = buildItinerary({ region: "Troodos", days: 3 });
    expect(result).toHaveLength(3);
  });

  it("includes morning, afternoon, evening slots", () => {
    const result = buildItinerary({ region: "Limassol", days: 1 });
    const slotTimes = result[0].slots.map((s) => s.timeOfDay);
    expect(slotTimes).toContain("morning");
    expect(slotTimes).toContain("afternoon");
  });

  it("respects interests filter", () => {
    const result = buildItinerary({
      region: "Limassol",
      days: 1,
      interests: ["wine"],
    });
    const allNames = result[0].slots.map((s) => s.name).join(" ").toLowerCase();
    // Should include wine-related places
    expect(
      result[0].slots.some(
        (s) => s.type === "winery" || s.name.toLowerCase().includes("wine")
      )
    ).toBe(true);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/concierge/__tests__/build-itinerary.test.ts`
Expected: FAIL

- [x] **Step 3: Implement build_itinerary**

```typescript
// src/lib/concierge/tools/build-itinerary.ts
import { searchPlaces } from "./search-places";

export type ItinerarySlot = {
  timeOfDay: "morning" | "afternoon" | "evening";
  id: string;
  name: string;
  type: string;
  region: string;
  reason: string;
};

export type ItineraryDay = {
  day: number;
  slots: ItinerarySlot[];
};

export type BuildItineraryInput = {
  region?: string;
  days: number;
  interests?: string[];
  userLocation?: { lat: number; lng: number };
};

const TIME_SLOTS: ("morning" | "afternoon" | "evening")[] = ["morning", "afternoon", "evening"];

const SLOT_CATEGORY_HINTS: Record<string, string[]> = {
  morning: ["ancient", "nature", "beach"],
  afternoon: ["village", "monastery", "winery"],
  evening: ["winery", "restaurant", "village"],
};

export function buildItinerary(input: BuildItineraryInput): ItineraryDay[] {
  const { region, days, interests, userLocation } = input;
  const usedIds = new Set<string>();
  const result: ItineraryDay[] = [];

  for (let d = 1; d <= Math.min(days, 14); d++) {
    const slots: ItinerarySlot[] = [];

    for (const timeOfDay of TIME_SLOTS) {
      const categoryHints = SLOT_CATEGORY_HINTS[timeOfDay];
      const category = interests?.length
        ? interests[0]
        : categoryHints[d % categoryHints.length];

      const places = searchPlaces({
        query: category,
        region,
        season: "winter",
        userLocation,
        limit: 10,
      });

      const place = places.find((p) => !usedIds.has(p.id));
      if (place) {
        usedIds.add(place.id);
        slots.push({
          timeOfDay,
          id: place.id,
          name: place.name,
          type: (place as { type?: string }).type ?? "attraction",
          region: place.region,
          reason: `Fits ${timeOfDay} — ${place.description?.slice(0, 80) ?? ""}`,
        });
      }
    }

    result.push({ day: d, slots });
  }

  return result;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/concierge/__tests__/build-itinerary.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/lib/concierge/tools/build-itinerary.ts src/lib/concierge/__tests__/build-itinerary.test.ts
git commit -m "feat(concierge): add build_itinerary tool with time-slot-based day planning"
```

---

## Task 8: Prompt Files

**Files:**
- Create: `src/lib/concierge/prompts/system-assistant.ts`
- Create: `src/lib/concierge/prompts/developer-tool-policy.ts`

- [x] **Step 1: Create system-assistant prompt**

```typescript
// src/lib/concierge/prompts/system-assistant.ts

export const SYSTEM_ASSISTANT_PROMPT = `You are the Cyprus Winter in-app travel assistant. You help travelers discover places, build itineraries, adapt plans to weather and timing, and move toward actions inside the app.

Be concise, practical, and personalized. Use the provided app data first. Never invent hours, prices, event schedules, trail conditions, or booking availability. If uncertain, say so clearly.

Prefer 3 to 5 strong recommendations over long lists. When planning, organize suggestions in a time-aware and geographically sensible order. When relevant, tailor suggestions to weather, transport mode, trip stage, budget, and user interests.

Behavior rules:
1. Be practical, concise, and personalized.
2. Use the provided app data and tools first. Do not rely on unsupported general world knowledge when app tools can answer.
3. Never invent business hours, prices, event schedules, trail conditions, or booking availability.
4. If information is missing or uncertain, say that clearly and continue with the best safe alternative.
5. Prefer recommendations that fit the user's current context: location, region, weather, time of day, transport mode, trip duration, interests, budget, group type.
6. When useful, explain why a recommendation fits the moment.
7. When the user asks for plans, return structured, time-aware suggestions rather than generic lists.
8. When the user seems ready to act, guide them toward app actions (save to plan, open place details, view trails, check events, book).
9. Do not overwhelm the user. Usually recommend 3 to 5 strong options.
10. For safety-related outdoor questions, be conservative. If trail or weather conditions are unclear, say so.
11. If the user's question is ambiguous, make the best helpful assumption from context instead of asking unnecessary follow-up questions.
12. Keep tone warm, competent, local, and calm.

Adapt your tone to match the user. Casual with casual users, precise with planners. Start warm-neutral; after 2-3 exchanges, calibrate to their style.

Always act like a local travel concierge inside the product, not a generic chatbot.`;

export function buildSystemPrompt(locale?: string): string {
  const langHint =
    locale && locale !== "en"
      ? `\n\nLanguage: If the user writes in German, Greek, or Polish, respond in the same language. Otherwise write in English.`
      : "";
  return SYSTEM_ASSISTANT_PROMPT + langHint;
}
```

- [x] **Step 2: Create developer-tool-policy prompt**

```typescript
// src/lib/concierge/prompts/developer-tool-policy.ts

export const DEVELOPER_TOOL_POLICY = `## Output Format

After your main text response, if you have specific places, trails, or events to suggest, append a structured block using this exact format:

---ACTIONS---
{
  "cards": [
    {"type": "place", "id": "place_id", "title": "Place Name", "reason": "Why it fits"}
  ],
  "actions": [
    {"type": "open_place", "label": "See Place Name", "payload": {"path": "/discover/place_id"}}
  ],
  "followUps": [
    "Make this a half-day route",
    "Add a winery stop"
  ]
}

Rules for the structured block:
- Only include if you have specific actionable suggestions
- Card IDs must match real place/trail IDs from the provided data
- Action types: open_place, save_to_plan, show_on_map, view_events, book_now, build_day_plan
- Follow-ups: 2-4 short, tappable suggestions for what the user might want next
- If no structured data is relevant, omit the ---ACTIONS--- block entirely

## Data Confidence

When presenting information from the provided data:
- State facts (trail exists, difficulty, region) directly
- For hours, prices, availability: use hedging language ("typically", "usually") and suggest confirming
- If data is missing: say so clearly and suggest an alternative or action

## Recommendations

For place recommendations, include: place name, short reason it fits, ideal visit context.
For itineraries: organize by morning/afternoon/evening with geographic logic to reduce backtracking.
For comparisons: give a clear verdict with reasoning.`;
```

- [x] **Step 3: Verify files compile**

Run: `npx tsc --noEmit`
Expected: No type errors

> Note: The spec defines 4 prompt files (`system-assistant.md`, `developer-tool-policy.md`, `itinerary-planner.md`, `recommendation-ranker.md`). For MVP, only the first two are needed. The itinerary planning logic lives in the `build-itinerary` tool function, and ranking logic lives in `ranking.ts`. Dedicated prompt files for those can be added post-MVP when more nuanced LLM guidance is needed.

- [x] **Step 4: Commit**

```bash
git add src/lib/concierge/prompts/
git commit -m "feat(concierge): add system-assistant and developer-tool-policy prompt modules"
```

---

## Task 9: Response Parser

**Files:**
- Create: `src/lib/concierge/response-parser.ts`
- Test: `src/lib/concierge/__tests__/response-parser.test.ts`

- [x] **Step 1: Write the failing test**

```typescript
// src/lib/concierge/__tests__/response-parser.test.ts
import { parseResponse } from "../response-parser";

describe("parseResponse", () => {
  it("splits prose from JSON on ---ACTIONS--- delimiter", () => {
    const raw = `Here are 3 villages near Paphos.

---ACTIONS---
{"cards":[{"type":"place","id":"kathikas","title":"Kathikas","reason":"Wine village"}],"actions":[{"type":"open_place","label":"See Kathikas"}],"followUps":["Add a winery"]}`;

    const result = parseResponse(raw);
    expect(result.prose).toBe("Here are 3 villages near Paphos.");
    expect(result.metadata?.cards).toHaveLength(1);
    expect(result.metadata?.cards?.[0].id).toBe("kathikas");
    expect(result.metadata?.actions).toHaveLength(1);
    expect(result.metadata?.followUps).toHaveLength(1);
  });

  it("returns prose-only when no delimiter present", () => {
    const raw = "Just a plain text response.";
    const result = parseResponse(raw);
    expect(result.prose).toBe("Just a plain text response.");
    expect(result.metadata).toBeUndefined();
  });

  it("handles malformed JSON gracefully", () => {
    const raw = `Some text\n\n---ACTIONS---\n{invalid json}`;
    const result = parseResponse(raw);
    expect(result.prose).toBe("Some text");
    expect(result.metadata).toBeUndefined();
  });

  it("trims whitespace around prose and delimiter", () => {
    const raw = `  Trimmed text  \n\n---ACTIONS---\n{"cards":[],"actions":[],"followUps":[]}`;
    const result = parseResponse(raw);
    expect(result.prose).toBe("Trimmed text");
    expect(result.metadata).toBeDefined();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/concierge/__tests__/response-parser.test.ts`
Expected: FAIL

- [x] **Step 3: Implement the response parser**

```typescript
// src/lib/concierge/response-parser.ts
import type { ResponseMetadata } from "./types";

const DELIMITER = "---ACTIONS---";

export type ParsedResponse = {
  prose: string;
  metadata?: ResponseMetadata;
};

export function parseResponse(raw: string): ParsedResponse {
  const delimiterIndex = raw.indexOf(DELIMITER);

  if (delimiterIndex === -1) {
    return { prose: raw.trim() };
  }

  const prose = raw.slice(0, delimiterIndex).trim();
  const jsonStr = raw.slice(delimiterIndex + DELIMITER.length).trim();

  try {
    const parsed = JSON.parse(jsonStr) as ResponseMetadata;
    return { prose, metadata: parsed };
  } catch {
    return { prose };
  }
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/concierge/__tests__/response-parser.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/lib/concierge/response-parser.ts src/lib/concierge/__tests__/response-parser.test.ts
git commit -m "feat(concierge): add response parser for ---ACTIONS--- delimiter splitting"
```

---

## Task 10: Orchestrator

**Files:**
- Create: `src/lib/concierge/orchestrator.ts`
- Test: `src/lib/concierge/__tests__/orchestrator.test.ts`

- [x] **Step 1: Write the failing test**

```typescript
// src/lib/concierge/__tests__/orchestrator.test.ts
import { orchestrate } from "../orchestrator";
import type { ConciergeContext } from "../types";

const baseCtx: ConciergeContext = {
  locale: "en",
  season: "winter",
  path: "/discover",
};

describe("orchestrate", () => {
  it("returns intents, tool results, and assembled prompt for a discover query", () => {
    const result = orchestrate("Best villages near Paphos", baseCtx);
    expect(result.intents).toContain("discover");
    expect(result.toolResults.length).toBeGreaterThan(0);
    expect(result.systemPrompt).toContain("Cyprus Winter");
    expect(result.contextBlock).toContain("Retrieved data");
  });

  it("includes weather data for weather-adapted queries", () => {
    const result = orchestrate("It's raining, what can we do?", baseCtx);
    expect(result.intents).toContain("weather_adapted");
    const weatherTool = result.toolResults.find((t) => t.tool === "get_weather");
    expect(weatherTool).toBeDefined();
  });

  it("includes transport data for airport queries", () => {
    const result = orchestrate("I just landed in Larnaca", baseCtx);
    expect(result.intents).toContain("airport_arrival");
    const transportTool = result.toolResults.find((t) => t.tool === "get_transport_options");
    expect(transportTool).toBeDefined();
  });

  it("includes nearby places when location is provided", () => {
    const ctx: ConciergeContext = {
      ...baseCtx,
      currentLocation: { lat: 34.68, lng: 33.04 },
    };
    const result = orchestrate("What's near me?", ctx);
    expect(result.intents).toContain("nearby");
    const nearbyTool = result.toolResults.find((t) => t.tool === "get_nearby_places");
    expect(nearbyTool).toBeDefined();
  });

  it("returns general intent with no tools for greetings", () => {
    const result = orchestrate("Hello!", baseCtx);
    expect(result.intents).toContain("general");
    expect(result.toolResults).toHaveLength(0);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/concierge/__tests__/orchestrator.test.ts`
Expected: FAIL

- [x] **Step 3: Implement the orchestrator**

```typescript
// src/lib/concierge/orchestrator.ts
import type { Intent, ConciergeContext, ToolResult, OrchestratorResult } from "./types";
import { classifyIntent } from "./intents";
import { searchPlaces } from "./tools/search-places";
import { searchTrails } from "./tools/search-trails";
import { searchEvents } from "./tools/search-events";
import { getWeather } from "./tools/get-weather";
import { getNearbyPlaces } from "./tools/get-nearby-places";
import { getTransportOptions } from "./tools/get-transport-options";
import { buildItinerary } from "./tools/build-itinerary";
import { buildSystemPrompt } from "./prompts/system-assistant";
import { DEVELOPER_TOOL_POLICY } from "./prompts/developer-tool-policy";

/** Intent → tool mapping from spec */
const INTENT_TOOLS: Record<Intent, string[]> = {
  plan_trip: ["build_itinerary", "search_places", "get_weather"],
  plan_today: ["build_itinerary", "get_weather", "search_places", "get_nearby_places"],
  discover: ["search_places", "get_weather"],
  weather_adapted: ["get_weather", "search_places", "search_trails"],
  nearby: ["get_nearby_places", "get_weather"],
  booking: ["search_places"],
  trails_outdoor: ["search_trails", "get_weather", "get_nearby_places"],
  airport_arrival: ["get_transport_options", "get_weather", "search_places"],
  search_compare: ["search_places", "search_trails", "search_events"],
  account_navigation: [],
  general: [],
};

function extractRegion(message: string): string | undefined {
  const regions = ["Paphos", "Limassol", "Larnaca", "Troodos", "Ayia Napa", "Nicosia", "Famagusta", "Protaras"];
  const lower = message.toLowerCase();
  return regions.find((r) => lower.includes(r.toLowerCase()));
}

function extractMonth(message: string): string | undefined {
  const months = ["November", "December", "January", "February", "March", "April"];
  const lower = message.toLowerCase();
  return months.find((m) => lower.includes(m.toLowerCase()));
}

function extractAirportCode(message: string): string | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("larnaca") || lower.includes("lca")) return "LCA";
  if (lower.includes("paphos") || lower.includes("pfo")) return "PFO";
  return undefined;
}

function executeTool(
  toolName: string,
  message: string,
  context: ConciergeContext
): ToolResult | undefined {
  const region = extractRegion(message) ?? context.path?.split("/").pop();

  switch (toolName) {
    case "search_places":
      return {
        tool: "search_places",
        data: searchPlaces({
          query: message,
          region: extractRegion(message),
          season: "winter",
          userLocation: context.currentLocation,
          limit: 5,
        }),
      };
    case "search_trails":
      return {
        tool: "search_trails",
        data: searchTrails({
          query: message,
          region: extractRegion(message),
          season: "winter",
          limit: 5,
        }),
      };
    case "search_events":
      return {
        tool: "search_events",
        data: searchEvents({
          month: extractMonth(message),
          region: extractRegion(message),
        }),
      };
    case "get_weather":
      return {
        tool: "get_weather",
        data: getWeather({ month: extractMonth(message) ?? "January" }),
      };
    case "get_nearby_places":
      if (!context.currentLocation) return undefined;
      return {
        tool: "get_nearby_places",
        data: getNearbyPlaces({
          lat: context.currentLocation.lat,
          lng: context.currentLocation.lng,
          radiusKm: 30,
        }),
      };
    case "get_transport_options": {
      const code = extractAirportCode(message);
      if (!code) return undefined;
      return {
        tool: "get_transport_options",
        data: getTransportOptions({ airportCode: code }),
      };
    }
    case "build_itinerary": {
      const days = message.match(/(\d+)\s*(day|days)/i);
      return {
        tool: "build_itinerary",
        data: buildItinerary({
          region: extractRegion(message),
          days: days ? parseInt(days[1], 10) : 1,
          userLocation: context.currentLocation,
        }),
      };
    }
    default:
      return undefined;
  }
}

export function orchestrate(message: string, context: ConciergeContext): OrchestratorResult {
  const intents = classifyIntent(message, context);

  // Collect unique tool names from all matched intents
  const toolNames = new Set<string>();
  for (const intent of intents) {
    for (const tool of INTENT_TOOLS[intent] ?? []) {
      toolNames.add(tool);
    }
  }

  // Execute tools
  const toolResults: ToolResult[] = [];
  for (const toolName of toolNames) {
    const result = executeTool(toolName, message, context);
    if (result) {
      toolResults.push(result);
    }
  }

  // Build system prompt
  const systemPrompt = buildSystemPrompt(context.locale);

  // Build context block from tool results
  let contextBlock = "";
  if (toolResults.length > 0) {
    contextBlock = "\n\n## Retrieved data (use this to ground your answer)\n\n";
    for (const tr of toolResults) {
      contextBlock += `### ${tr.tool}\n\`\`\`json\n${JSON.stringify(tr.data, null, 2)}\n\`\`\`\n\n`;
    }
  }

  // Add user context
  const ctxParts: string[] = [];
  if (context.path) ctxParts.push(`User is on page: ${context.path}`);
  if (context.currentLocation) {
    ctxParts.push(`User location: ${context.currentLocation.lat}, ${context.currentLocation.lng}`);
  }
  if (context.itinerary?.length) {
    const dayLines = context.itinerary
      .sort((a, b) => a.day - b.day)
      .map(({ day, placeIds }) => `Day ${day}: ${placeIds.join(", ")}`);
    ctxParts.push(`User's plan: ${dayLines.join("; ")}`);
  }
  if (context.tripDates) {
    ctxParts.push(`Trip dates: ${context.tripDates.start} to ${context.tripDates.end}`);
  }
  if (context.tripStage) {
    ctxParts.push(`Trip stage: ${context.tripStage}`);
  }

  if (ctxParts.length > 0) {
    contextBlock += `\n### User context\n${ctxParts.join("\n")}\n`;
  }

  return {
    intents,
    toolResults,
    systemPrompt: systemPrompt + "\n\n" + DEVELOPER_TOOL_POLICY,
    contextBlock,
  };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/concierge/__tests__/orchestrator.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/lib/concierge/orchestrator.ts src/lib/concierge/__tests__/orchestrator.test.ts
git commit -m "feat(concierge): add orchestrator with intent-to-tool routing and context assembly"
```

---

## Task 11: Chat Schema Expansion

**Files:**
- Modify: `src/lib/chat-schema.ts`

- [x] **Step 1: Add new fields to chat request schema**

In `src/lib/chat-schema.ts`, add `currentLocation`, `tripDates`, and `tripStage` to the context object:

```typescript
// Replace the existing context object schema
context: z
  .object({
    locale: z.enum(["en", "el", "de", "pl"]).optional(),
    path: z.string().max(256).optional(),
    lastPlace: z.string().max(256).optional(),
    itinerary: z
      .array(z.object({ day: z.number().int().min(1), placeIds: z.array(z.string().max(128)) }))
      .max(14)
      .optional(),
    currentLocation: z
      .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
      .optional(),
    tripDates: z
      .object({ start: z.string().max(32), end: z.string().max(32) })
      .optional(),
    tripStage: z.enum(["pre_trip", "during_trip", "post_trip"]).optional(),
  })
  .optional(),
```

- [x] **Step 2: Verify existing tests still pass**

Run: `npx vitest run`
Expected: All existing tests pass

- [x] **Step 3: Commit**

```bash
git add src/lib/chat-schema.ts
git commit -m "feat(chat): expand chat request schema with location, trip dates, and trip stage"
```

---

## Task 12: Rewrite Chat API Route

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [x] **Step 1: Integrate orchestrator into the route handler**

The route handler needs to:
1. Check if the active provider is capable (not Ollama/Groq Llama 8B)
2. If capable: run orchestrator → build enriched prompt → stream response → split on delimiter → send metadata event
3. If not capable: use legacy prompt path (current behavior)

Key changes to `src/app/api/chat/route.ts`:

```typescript
// Add imports at top
import { orchestrate } from "@/lib/concierge/orchestrator";
import { parseResponse } from "@/lib/concierge/response-parser";
import type { ConciergeContext } from "@/lib/concierge/types";

// Add capability check
function isCapableProvider(provider: Provider): boolean {
  const weakModels = ["llama-3.1-8b-instant", "llama3.2", "moonshot-v1-8k"];
  return !weakModels.includes(provider.model) && !provider.isOllama;
}

// In the POST function, after normalizeChatContext:
// Build concierge context
const conciergeCtx: ConciergeContext = {
  locale: ctx?.locale ?? "en",
  path: ctx?.path,
  lastPlace: ctx?.lastPlace,
  itinerary: ctx?.itinerary,
  currentLocation: (parsed.data.context as Record<string, unknown>)?.currentLocation as { lat: number; lng: number } | undefined,
  tripDates: (parsed.data.context as Record<string, unknown>)?.tripDates as { start: string; end: string } | undefined,
  tripStage: (parsed.data.context as Record<string, unknown>)?.tripStage as "pre_trip" | "during_trip" | "post_trip" | undefined,
  season: "winter",
};
```

The streaming handler needs modification to buffer the full response, then split on `---ACTIONS---`:

```typescript
// Modified streaming handler for capable providers
const stream = new ReadableStream({
  async start(controller) {
    try {
      let fullContent = "";
      let sentProseUpTo = 0;
      const delimiter = "---ACTIONS---";

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;

          // Stream prose up to but not including the delimiter
          const delimIdx = fullContent.indexOf(delimiter);
          if (delimIdx === -1) {
            // No delimiter yet — stream everything we have
            const toSend = fullContent.slice(sentProseUpTo);
            if (toSend) {
              controller.enqueue(encoder.encode(emitChunk({ delta: toSend })));
              sentProseUpTo = fullContent.length;
            }
          }
          // If delimiter found, stop streaming new prose chunks
        }
      }

      // Parse the final response
      const delimIdx = fullContent.indexOf(delimiter);
      if (delimIdx !== -1) {
        // Send any unsent prose before the delimiter
        const unseenProse = fullContent.slice(sentProseUpTo, delimIdx).trim();
        if (unseenProse) {
          controller.enqueue(encoder.encode(emitChunk({ delta: unseenProse })));
        }

        // Parse and send metadata
        const jsonStr = fullContent.slice(delimIdx + delimiter.length).trim();
        try {
          const metadata = JSON.parse(jsonStr);
          controller.enqueue(encoder.encode(emitChunk({ type: "metadata", ...metadata })));
        } catch {
          // Malformed JSON — skip metadata
        }
      }

      controller.enqueue(encoder.encode(emitChunk({ done: true })));
      controller.close();
    } catch (streamErr) {
      const msg = streamErr instanceof Error ? streamErr.message : String(streamErr);
      const safeMessage = process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : msg;
      controller.enqueue(encoder.encode(emitChunk({ error: safeMessage })));
      controller.close();
    }
  },
});
```

For the system prompt construction in capable mode:

```typescript
// Replace current systemWithContext for capable providers
const { systemPrompt, contextBlock } = orchestrate(
  messages[messages.length - 1].content,
  conciergeCtx
);
const systemWithContext = `${systemPrompt}\n\n${contextBlock}`;
```

Keep the legacy path (`buildAIContextRelevant()` + `SYSTEM_PROMPT_BASE`) for weak providers.

**Integration approach:** The existing `route.ts` has a `for (const provider of providers)` loop. The changes are:

1. Before the loop: build `ConciergeContext` from the parsed request
2. Inside the loop, before creating the `apiMessages` array: check `isCapableProvider(provider)`. If capable, use `orchestrate()` to build the system prompt. If not, use the existing `buildSystemPrompt()` + `buildAIContextRelevant()` path.
3. Replace the streaming handler's `start(controller)` body with the delimiter-aware version for capable providers.

**Exact insertion points in current `route.ts`:**

- **Line 180** (after `const ctx = normalizeChatContext(...)`) — insert `ConciergeContext` construction
- **Line 215** (replace `const systemWithContext = ...`) — branch based on capable vs legacy
- **Lines 246-267** (the `ReadableStream.start(controller)` body) — replace with delimiter-aware streaming for capable providers

The existing rate limiting, provider loop, error handling, and fallback logic remain unchanged.

- [x] **Step 2: Write a test for `isCapableProvider`**

```typescript
// src/lib/concierge/__tests__/capable-provider.test.ts
import type OpenAI from "openai";

// Inline test since isCapableProvider is a small helper
function isCapableProvider(provider: { model: string; isOllama?: boolean }): boolean {
  const weakModels = ["llama-3.1-8b-instant", "llama3.2", "moonshot-v1-8k"];
  return !weakModels.includes(provider.model) && !provider.isOllama;
}

describe("isCapableProvider", () => {
  it("marks grok-3-mini as capable", () => {
    expect(isCapableProvider({ model: "grok-3-mini" })).toBe(true);
  });
  it("marks gpt-4o-mini as capable", () => {
    expect(isCapableProvider({ model: "gpt-4o-mini" })).toBe(true);
  });
  it("marks llama-3.1-8b-instant as not capable", () => {
    expect(isCapableProvider({ model: "llama-3.1-8b-instant" })).toBe(false);
  });
  it("marks ollama provider as not capable", () => {
    expect(isCapableProvider({ model: "llama3.2", isOllama: true })).toBe(false);
  });
  it("marks moonshot as not capable", () => {
    expect(isCapableProvider({ model: "moonshot-v1-8k" })).toBe(false);
  });
});
```

- [x] **Step 3: Run capability test**

Run: `npx vitest run src/lib/concierge/__tests__/capable-provider.test.ts`
Expected: PASS

- [x] **Step 4: Verify the route compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [x] **Step 5: Manual smoke test**

Run: `npm run dev` and send a chat message. Verify streaming still works for both capable and legacy providers.

- [x] **Step 6: Commit**

```bash
git add src/app/api/chat/route.ts src/lib/concierge/__tests__/capable-provider.test.ts
git commit -m "feat(chat): integrate concierge orchestrator with capable model detection and metadata streaming"
```

---

## Task 13: Client-Side Metadata Handling

**Files:**
- Modify: `src/components/ai/hooks/useAIChat.ts`

- [x] **Step 1: Add metadata type to Message and handle metadata SSE events**

Add to the `Message` type:

```typescript
export type Message = {
  role: "user" | "assistant";
  content: string;
  isRetryable?: boolean;
  is503?: boolean;
  metadata?: {
    cards?: { type: string; id: string; title: string; reason: string }[];
    actions?: { type: string; label: string; payload?: Record<string, unknown> }[];
    followUps?: string[];
  };
};
```

The SSE parsing lives in `useAIChat.ts` inside the `sendMessage` function. The existing code uses `iterateSseData()` from `src/lib/sse.ts` to parse SSE lines. The iteration loop currently handles two event shapes: `{ delta: string }` (content chunk) and `{ done: true }` (stream end).

Add a third case for `{ type: "metadata", ... }` events. The exact location is inside the `for await (const parsed of iterateSseData(response))` loop (or equivalent), after the `delta` check:

```typescript
// Existing: handles { delta: "text" }
if (parsed.delta) {
  assistantContent += parsed.delta;
  // ... update message state
}

// NEW: handles { type: "metadata", cards: [...], actions: [...], followUps: [...] }
if (parsed.type === "metadata") {
  const { type: _type, ...metadata } = parsed;
  setMessages((prev) => {
    const updated = [...prev];
    const lastMsg = updated[updated.length - 1];
    if (lastMsg?.role === "assistant") {
      updated[updated.length - 1] = { ...lastMsg, metadata };
    }
    return updated;
  });
}

// Existing: handles { done: true }
if (parsed.done) break;
```

Also update the context sent to the API to include new fields:

```typescript
// In sendMessage, update the context object
const context: Record<string, unknown> = {
  locale,
  path: pathname?.replace(`/${locale}`, "") || "/",
  lastPlace: typeof window !== "undefined" ? sessionStorage.getItem(LAST_PLACE_KEY) ?? undefined : undefined,
  itinerary: getItineraryForChat(),
};

// Add geolocation if available
if (typeof navigator !== "undefined" && navigator.geolocation) {
  // Use cached position if available (don't block on geolocation request)
  const cachedPos = sessionStorage.getItem("cyprus-winter-location");
  if (cachedPos) {
    try {
      context.currentLocation = JSON.parse(cachedPos);
    } catch { /* ignore */ }
  }
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [x] **Step 3: Commit**

```bash
git add src/components/ai/hooks/useAIChat.ts
git commit -m "feat(chat): handle metadata SSE events and extend Message type with structured data"
```

---

## Task 14: Chat UI Components — Action Buttons, Place Cards, Follow-Up Chips

**Files:**
- Create: `src/components/ai/ActionButtons.tsx`
- Create: `src/components/ai/PlaceCards.tsx`
- Create: `src/components/ai/FollowUpChips.tsx`
- Modify: `src/components/ai/AIAssistant.tsx`

- [x] **Step 1: Create ActionButtons component**

```tsx
// src/components/ai/ActionButtons.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

type Action = {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
};

export function ActionButtons({ actions }: { actions: Action[] }) {
  const router = useRouter();
  const locale = useLocale();

  function handleAction(action: Action) {
    switch (action.type) {
      case "open_place":
      case "show_on_map":
      case "view_events":
      case "book_now":
      case "build_day_plan": {
        const path = (action.payload?.path as string) ?? "/discover";
        router.push(`/${locale}${path}`);
        break;
      }
      case "save_to_plan": {
        router.push(`/${locale}/plan`);
        break;
      }
    }
  }

  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => handleAction(action)}
          className="px-3 py-1.5 text-xs font-medium rounded-full bg-olive-100 text-olive-800 hover:bg-olive-200 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
```

- [x] **Step 2: Create PlaceCards component**

```tsx
// src/components/ai/PlaceCards.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

type Card = {
  type: string;
  id: string;
  title: string;
  reason: string;
};

const TYPE_ICONS: Record<string, string> = {
  place: "📍",
  trail: "🥾",
  winery: "🍷",
  event: "🎭",
};

export function PlaceCards({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const locale = useLocale();

  function handleClick(card: Card) {
    const basePath = card.type === "trail" ? "/trails" : "/discover";
    router.push(`/${locale}${basePath}/${card.id}`);
  }

  if (!cards.length) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => handleClick(card)}
          className="flex items-start gap-2 p-2 rounded-lg bg-sand-50 hover:bg-sand-100 transition-colors text-left"
        >
          <span className="text-base mt-0.5">{TYPE_ICONS[card.type] ?? "📍"}</span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-olive-900 truncate">{card.title}</div>
            <div className="text-xs text-olive-600 line-clamp-1">{card.reason}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
```

- [x] **Step 3: Create FollowUpChips component**

```tsx
// src/components/ai/FollowUpChips.tsx
"use client";

export function FollowUpChips({
  chips,
  onSelect,
}: {
  chips: string[];
  onSelect: (chip: string) => void;
}) {
  if (!chips.length) return null;

  return (
    <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onSelect(chip)}
          className="shrink-0 px-3 py-1 text-xs rounded-full border border-olive-200 text-olive-700 hover:bg-olive-50 transition-colors whitespace-nowrap"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
```

- [x] **Step 4: Write render smoke tests for UI components**

```typescript
// src/components/ai/__tests__/chat-ui.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionButtons } from "../ActionButtons";
import { PlaceCards } from "../PlaceCards";
import { FollowUpChips } from "../FollowUpChips";

// Mock next/navigation and next-intl
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

describe("ActionButtons", () => {
  it("renders action buttons", () => {
    render(<ActionButtons actions={[{ type: "open_place", label: "See Omodos" }]} />);
    expect(screen.getByText("See Omodos")).toBeInTheDocument();
  });

  it("renders nothing for empty actions", () => {
    const { container } = render(<ActionButtons actions={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("PlaceCards", () => {
  it("renders place cards", () => {
    render(
      <PlaceCards cards={[{ type: "place", id: "omodos", title: "Omodos", reason: "Wine village" }]} />
    );
    expect(screen.getByText("Omodos")).toBeInTheDocument();
    expect(screen.getByText("Wine village")).toBeInTheDocument();
  });
});

describe("FollowUpChips", () => {
  it("renders chips and calls onSelect", () => {
    const onSelect = jest.fn();
    render(<FollowUpChips chips={["Plan my day", "Add a winery"]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Plan my day"));
    expect(onSelect).toHaveBeenCalledWith("Plan my day");
  });
});
```

- [x] **Step 5: Run UI component tests**

Run: `npx vitest run src/components/ai/__tests__/chat-ui.test.tsx`
Expected: PASS

- [x] **Step 6: Integrate into AIChatMessages**

The integration point is `src/components/ai/AIChatMessages.tsx`, inside the `ChatMessage` function. The metadata components render **after** the ReactMarkdown block for assistant messages, inside the existing message bubble `<div>`.

At line 52 in `AIChatMessages.tsx`, after `</ReactMarkdown>` and closing `</div>`, add:

```tsx
// After the ReactMarkdown prose div (line 53), before the retry button (line 55):
{message.metadata?.cards && <PlaceCards cards={message.metadata.cards} />}
{message.metadata?.actions && <ActionButtons actions={message.metadata.actions} />}
{message.metadata?.followUps && (
  <FollowUpChips
    chips={message.metadata.followUps}
    onSelect={(chip) => {
      // Dispatch a custom event that useAIChat listens for
      window.dispatchEvent(new CustomEvent("ai-followup", { detail: chip }));
    }}
  />
)}
```

Import the three new components at the top of `AIChatMessages.tsx`:

```tsx
import { ActionButtons } from "./ActionButtons";
import { PlaceCards } from "./PlaceCards";
import { FollowUpChips } from "./FollowUpChips";
```

For the `FollowUpChips` `onSelect` handler: since `AIChatMessages` doesn't have access to `sendMessage`, use a custom event. In `useAIChat.ts`, add a listener:

```typescript
useEffect(() => {
  const handler = (e: CustomEvent) => sendMessage(e.detail);
  window.addEventListener("ai-followup", handler as EventListener);
  return () => window.removeEventListener("ai-followup", handler as EventListener);
}, [sendMessage]);
```

Alternatively, pass `sendMessage` as a prop through `AIChatMessages` → `ChatMessage` if you prefer prop threading over events.

- [x] **Step 7: Verify it compiles and renders**

Run: `npx tsc --noEmit && npm run dev`
Expected: No errors. Chat renders normally. Metadata components appear when assistant sends structured data.

- [x] **Step 8: Commit**

```bash
git add src/components/ai/ActionButtons.tsx src/components/ai/PlaceCards.tsx src/components/ai/FollowUpChips.tsx src/components/ai/AIChatMessages.tsx src/components/ai/__tests__/chat-ui.test.tsx
git commit -m "feat(chat-ui): add action buttons, place cards, and follow-up chips components"
```

---

## Task 15: Contextual Opener

**Files:**
- Modify: `src/components/ai/hooks/useAIChat.ts`

- [x] **Step 1: Replace static initial message with context-aware opener**

Replace the `INITIAL_MESSAGE` constant and its usage. Instead of a static greeting, generate a dynamic opener based on the current path:

```typescript
function buildContextualOpener(path: string): Message {
  const base = "Hi — I know the island. ";

  if (path.includes("/trails")) {
    return {
      role: "assistant",
      content: base + "Looking for a trail? I can help match one to today's weather and your fitness level.",
      metadata: {
        followUps: ["Easy winter hike", "Trail conditions today", "Combine a trail with a village"],
      },
    };
  }
  if (path.includes("/discover")) {
    return {
      role: "assistant",
      content: base + "Exploring places? Tell me your region or what you're in the mood for — I'll narrow it down.",
      metadata: {
        followUps: ["Best villages near me", "Hidden beaches", "Family-friendly picks"],
      },
    };
  }
  if (path.includes("/plan")) {
    return {
      role: "assistant",
      content: base + "Building your plan? I can suggest what fits each day, or fill gaps in your itinerary.",
      metadata: {
        followUps: ["Plan my day", "Best route for Day 1", "Add a winery stop"],
      },
    };
  }
  if (path.includes("/airport")) {
    return {
      role: "assistant",
      content: base + "Just arrived or planning to? I can help with transport, first stops, and your opening day.",
      metadata: {
        followUps: ["I just landed in Larnaca", "Transport to Limassol", "What to do first"],
      },
    };
  }

  return {
    role: "assistant",
    content: base + "Trails, wineries, villages, day plans — ask anything, or tap a suggestion below.",
    metadata: {
      followUps: [
        "Plan my 3-day trip",
        "Best wineries with a view",
        "What should I do today?",
        "Easy winter hike",
      ],
    },
  };
}
```

Update the initialization logic to use this function instead of the static `INITIAL_MESSAGE`.

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [x] **Step 3: Commit**

```bash
git add src/components/ai/hooks/useAIChat.ts
git commit -m "feat(chat): add context-aware opener with follow-up chips based on current page"
```

---

## Task 16: Integration Test — Full Flow

**Files:**
- Test: `src/lib/concierge/__tests__/integration.test.ts`

- [x] **Step 1: Write integration test covering the full orchestrate → parse flow**

```typescript
// src/lib/concierge/__tests__/integration.test.ts
import { orchestrate } from "../orchestrator";
import { parseResponse } from "../response-parser";
import type { ConciergeContext } from "../types";

describe("concierge integration", () => {
  const ctx: ConciergeContext = {
    locale: "en",
    season: "winter",
    path: "/discover",
  };

  it("orchestrator produces a valid system prompt with tool data for discover intent", () => {
    const result = orchestrate("Best villages near Paphos", ctx);

    expect(result.intents).toContain("discover");
    expect(result.systemPrompt).toContain("Cyprus Winter");
    expect(result.systemPrompt).toContain("---ACTIONS---"); // developer policy mentions the format
    expect(result.contextBlock).toContain("search_places");
  });

  it("response parser correctly handles a well-formed response", () => {
    const mockLLMResponse = `Omodos is a beautiful village in the Troodos foothills.

---ACTIONS---
{"cards":[{"type":"place","id":"omodos","title":"Omodos","reason":"Wine village with character"}],"actions":[{"type":"open_place","label":"See Omodos","payload":{"path":"/discover/omodos"}}],"followUps":["Add a winery stop","Plan a day trip"]}`;

    const parsed = parseResponse(mockLLMResponse);
    expect(parsed.prose).toBe("Omodos is a beautiful village in the Troodos foothills.");
    expect(parsed.metadata?.cards).toHaveLength(1);
    expect(parsed.metadata?.actions).toHaveLength(1);
    expect(parsed.metadata?.followUps).toHaveLength(2);
  });

  it("orchestrator handles nearby intent with location", () => {
    const nearbyCtx: ConciergeContext = {
      ...ctx,
      currentLocation: { lat: 34.68, lng: 33.04 },
    };
    const result = orchestrate("What's near me?", nearbyCtx);
    expect(result.intents).toContain("nearby");
    expect(result.toolResults.some((t) => t.tool === "get_nearby_places")).toBe(true);
  });

  it("orchestrator handles airport arrival intent", () => {
    const result = orchestrate("I just arrived at Larnaca airport", ctx);
    expect(result.intents).toContain("airport_arrival");
    expect(result.toolResults.some((t) => t.tool === "get_transport_options")).toBe(true);
  });

  it("all tool results are JSON-serializable", () => {
    const result = orchestrate("Plan 3 days in Limassol", ctx);
    for (const tr of result.toolResults) {
      expect(() => JSON.stringify(tr.data)).not.toThrow();
    }
  });
});
```

- [x] **Step 2: Run integration test**

Run: `npx vitest run src/lib/concierge/__tests__/integration.test.ts`
Expected: PASS

- [x] **Step 3: Run all concierge tests**

Run: `npx vitest run src/lib/concierge/`
Expected: All tests PASS

- [x] **Step 4: Build the app**

Run: `npx next build`
Expected: Build succeeds

- [x] **Step 5: Commit**

```bash
git add src/lib/concierge/__tests__/integration.test.ts
git commit -m "test(concierge): add integration tests for full orchestrate-to-parse flow"
```

---

## Task 17: Final Verification

- [x] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [x] **Step 2: Run linter**

Run: `npx next lint`
Expected: No errors

- [x] **Step 3: Build**

Run: `npx next build`
Expected: Build succeeds

- [x] **Step 4: Manual smoke test**

Run: `npm run dev`, open the app, and test these chat flows:
1. "Best villages near Paphos" → should return place cards + action buttons
2. "Plan my day in Limassol" → should return structured day plan
3. "I just landed in Larnaca" → should return transport info
4. "What's near me?" (with geolocation) → should return nearby places
5. Plain greeting "Hello" → should return text-only response (no metadata)

- [x] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address smoke test findings"
```

# Persona WOW Fast Wins + Share Recipient View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the core “wow” loops with fast wins (Airport→48h plan payoff, Events freshness cues, Plan share UX), then ship a recipient-friendly Plan share route with dynamic metadata.

**Architecture:** Reuse the existing plan data model (`Record<number, string[]>` place IDs) and existing plan share encoding (`src/lib/itinerary-share.ts`) for “Open in Plan”, while introducing a **share recipient URL** that encodes a **validated, minimal, no-PII payload** as base64url JSON in `p=`. Recipient page is read-only and derives title/description for preview metadata.

**Tech Stack:** Next.js App Router, next-intl, Tailwind, Zod (already in repo), Playwright.

---

## File map (create/modify)

**Create**
- `src/lib/shared-plan.ts` — encode/decode SharedPlanV1 payload, with schema validation and hard caps.
- `src/app/(padded)/share/plan/page.tsx` — recipient view UI (read-only summary + CTA to open in Plan).
- `src/app/(padded)/share/plan/layout.tsx` — `generateMetadata` for dynamic title/description.
- `src/components/plan/PlanStartHere.tsx` — small “Start here” block for short-stay landings.
- `src/lib/shared-plan.test.ts` — unit tests for encoding/decoding + constraints.

**Modify**
- `src/hooks/useItinerary.ts` — build share recipient path for share links/copy link; keep existing `/plan?plan=` for editor.
- `src/lib/itinerary-share.test.ts` and/or `src/hooks/useItinerary.test.tsx` — update expectations if share path changes.
- `src/hooks/usePlanUrlActions.ts` + `src/hooks/usePlanPage.ts` + `src/app/(padded)/plan/page.tsx` — plumb “template applied from URL” state; show `PlanStartHere` for short-stay.
- `src/components/plan/PlanShareBar.tsx` — copy tweaks + share text defaults; add a “recipient view” hint line.
- `src/app/(padded)/events/page.tsx` — add freshness cue above the fold and improve empty-state recovery CTA.
- `messages/*.json` — add any new copy keys used by the above components (keep English first; follow existing i18n patterns).

---

### Task 1: Shared plan payload encoding/decoding (no PII)

**Files:**
- Create: `src/lib/shared-plan.ts`
- Create: `src/lib/shared-plan.test.ts`

- [ ] **Step 1: Create `SharedPlanV1` schema + helpers**

Implement:

```ts
// src/lib/shared-plan.ts
import { z } from "zod";
import { getPlaceById } from "@/data";

const MAX_DAYS = 7;
const MAX_ITEMS_PER_DAY = 6;
const MAX_DECODED_BYTES = 3_000;

const sharedItemSchema = z.object({
  id: z.string().min(1),
  t: z.enum(["attraction", "trail", "winery", "restaurant", "event"]),
});

const sharedDaySchema = z.object({
  d: z.number().int().min(1).max(MAX_DAYS),
  items: z.array(sharedItemSchema).max(MAX_ITEMS_PER_DAY),
});

export const sharedPlanV1Schema = z.object({
  v: z.literal(1),
  template: z.enum(["short-stay", "classic-7", "none"]).optional(),
  days: z.array(sharedDaySchema).max(MAX_DAYS),
});

export type SharedPlanV1 = z.infer<typeof sharedPlanV1Schema>;

function base64UrlEncodeUtf8(input: string): string {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(input, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecodeUtf8(input: string): string | null {
  if (!input || input.length > 6000) return null;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  try {
    const raw =
      typeof Buffer !== "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : decodeURIComponent(escape(atob(padded)));
    if (raw.length > MAX_DECODED_BYTES) return null;
    return raw;
  } catch {
    return null;
  }
}

export function buildSharedPlanFromItineraryDays(
  days: Record<number, string[]>,
  template?: SharedPlanV1["template"]
): SharedPlanV1 {
  const outDays: SharedPlanV1["days"] = [];
  for (let d = 1; d <= MAX_DAYS; d++) {
    const ids = days[d] ?? [];
    if (ids.length === 0) continue;
    const items = ids
      .slice(0, MAX_ITEMS_PER_DAY)
      .map((id) => getPlaceById(id))
      .filter(Boolean)
      .map((p) => ({ id: p.id, t: p.type as SharedPlanV1["days"][number]["items"][number]["t"] }));
    if (items.length) outDays.push({ d, items });
  }
  return { v: 1, template, days: outDays };
}

export function encodeSharedPlanParam(plan: SharedPlanV1): string {
  const validated = sharedPlanV1Schema.parse(plan);
  return base64UrlEncodeUtf8(JSON.stringify(validated));
}

export function decodeSharedPlanParam(param: string | null): SharedPlanV1 | null {
  const decoded = base64UrlDecodeUtf8(param ?? "");
  if (!decoded) return null;
  try {
    const json = JSON.parse(decoded);
    const parsed = sharedPlanV1Schema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Add unit tests**

```ts
// src/lib/shared-plan.test.ts
import { describe, it, expect } from "vitest";
import { decodeSharedPlanParam, encodeSharedPlanParam } from "@/lib/shared-plan";

describe("shared plan encoding", () => {
  it("round-trips a minimal plan", () => {
    const p = encodeSharedPlanParam({ v: 1, template: "short-stay", days: [{ d: 1, items: [{ id: "kourion", t: "attraction" }] }] });
    const out = decodeSharedPlanParam(p);
    expect(out?.v).toBe(1);
    expect(out?.days[0]?.d).toBe(1);
    expect(out?.days[0]?.items[0]?.id).toBe("kourion");
  });

  it("rejects invalid payloads", () => {
    expect(decodeSharedPlanParam("not-base64")).toBeNull();
  });
});
```

- [ ] **Step 3: Run unit tests**

Run: `npm run test`  
Expected: PASS.

---

### Task 2: Share recipient view route + dynamic metadata

**Files:**
- Create: `src/app/(padded)/share/plan/layout.tsx`
- Create: `src/app/(padded)/share/plan/page.tsx`
- Modify: `src/lib/itinerary-share.ts` (only if helpers needed)

- [ ] **Step 1: Implement `generateMetadata`**

```ts
// src/app/(padded)/share/plan/layout.tsx
import type { Metadata } from "next";
import { decodeSharedPlanParam } from "@/lib/shared-plan";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const p = typeof sp.p === "string" ? sp.p : null;
  const plan = decodeSharedPlanParam(p);

  const title = plan?.template === "short-stay"
    ? "48 hours: Troodos + wine — Cyprus Winter"
    : "Shared plan — Cyprus Winter";
  const description =
    "A calm, curated winter plan for Cyprus. Open it in Plan to save and tweak.";

  return {
    title,
    description,
    alternates: buildStrategyAAlternates("/share/plan"),
    openGraph: { title, description, url: `${SITE_URL}/share/plan` },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Implement recipient view UI**

```tsx
// src/app/(padded)/share/plan/page.tsx
import { decodeSharedPlanParam } from "@/lib/shared-plan";
import { encodeItinerary } from "@/lib/itinerary-share";
import { getPlaceById } from "@/data";
import AppLink from "@/components/AppLink";
import { LAYOUT, CARD, CTA, TYPE } from "@/lib/design-tokens";

export default async function SharePlanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const p = typeof sp.p === "string" ? sp.p : null;
  const plan = decodeSharedPlanParam(p);

  if (!plan || plan.days.length === 0) {
    return (
      <div className="min-h-screen bg-sand">
        <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} py-16`}>
          <div className={`${CARD.base} ${CARD.content}`}>
            <h1 className={TYPE.pageTitle}>This shared plan link is invalid</h1>
            <p className="mt-2 text-olive/70">Ask the sender to copy the link again.</p>
            <div className="mt-6">
              <AppLink href="/discover" className={CTA.primaryCompact}>Explore instead</AppLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const itineraryDays: Record<number, string[]> = {};
  for (const day of plan.days) itineraryDays[day.d] = day.items.map((i) => i.id);
  const encoded = encodeItinerary(itineraryDays);
  const openInPlanHref = encoded ? `/plan?plan=${encodeURIComponent(encoded)}` : "/plan";

  return (
    <div className="min-h-screen bg-sand">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} py-10 sm:py-14 flex flex-col gap-6`}>
        <div className={`${CARD.base} ${CARD.content}`}>
          <p className="text-sm text-olive/60">Shared plan</p>
          <h1 className={`${TYPE.pageTitle} mt-1`}>A calm winter plan for Cyprus</h1>
          <p className="mt-2 text-olive/80">Open it in Plan to save, tweak, and add bookings.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <AppLink href={openInPlanHref} className={CTA.primaryCompact}>Open in Plan</AppLink>
            <AppLink href="/discover" className={CTA.secondaryCompact}>Browse places</AppLink>
          </div>
        </div>

        {plan.days.map((day) => (
          <section key={day.d} className={`${CARD.base} ${CARD.content}`}>
            <h2 className="font-semibold text-olive">Day {day.d}</h2>
            <ul className="mt-3 space-y-2">
              {day.items.map((it) => {
                const place = getPlaceById(it.id);
                return (
                  <li key={it.id} className="text-olive/85">
                    {place ? (
                      <span className="font-medium">{place.name}</span>
                    ) : (
                      <span className="font-medium">{it.id}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run build to ensure server components compile**

Run: `npm run build`  
Expected: PASS.

---

### Task 3: Wire share recipient path into Plan share UI (G1 lite)

**Files:**
- Modify: `src/hooks/useItinerary.ts`
- Modify: `src/components/plan/PlanShareBar.tsx`
- Modify: `src/hooks/useItinerary.test.tsx` (as needed)

- [ ] **Step 1: Change `sharePath` to point to `/share/plan?p=`**

Implement in `useItinerary.ts`:
- Build `SharedPlanV1` using `buildSharedPlanFromItineraryDays(days, template?)`.
- Replace `sharePath` with `/share/plan?p=${encodeSharedPlanParam(shared)}` when `hasContent`.
- Keep the existing `/plan?plan=` behavior for “Open in Plan” (recipient page CTA).

- [ ] **Step 2: Update PlanShareBar copy**

In `PlanShareBar.tsx`:
- Change the button label from “Copy & share” to “Share your plan” (or similar).
- Change `ShareLinks` text default from `"My Cyprus Winter itinerary —"` to `"My Cyprus Winter plan —"`.
- Add a short hint line in the menu footer: “Recipient gets a clean, read-only summary.”

- [ ] **Step 3: Update any unit tests that assert `sharePath`**

Run: `npm run test`  
Expected: PASS.

---

### Task 4: G5 lite — “Start here” block for short-stay template landings

**Files:**
- Create: `src/components/plan/PlanStartHere.tsx`
- Modify: `src/hooks/usePlanUrlActions.ts`
- Modify: `src/hooks/usePlanPage.ts`
- Modify: `src/app/(padded)/plan/page.tsx`

- [ ] **Step 1: Add callback to `usePlanUrlActions`**

Extend params with:

```ts
onTemplateApplied?: (key: TemplateKey) => void;
```

Call it immediately before `router.replace("/plan", { scroll: false })`.

- [ ] **Step 2: Track last template applied in `usePlanPage`**

Add state:
- `templateAppliedFromUrl: TemplateKey | null`
- return it from the hook

Pass `onTemplateApplied` into `usePlanUrlActions` to set this state.

- [ ] **Step 3: Implement `PlanStartHere`**

Render a compact card with:
- Title: “Start here”
- 1–2 line framing: “Tonight · Tomorrow · Day 2”
- Two actions:
  - Primary: jump to Day 1/“Tonight” section (use passed callback)
  - Secondary: “Add the first stop” (open browse modal)

- [ ] **Step 4: Render `PlanStartHere` in `PlanPage`**

Show it when:
- `templateAppliedFromUrl === "short-stay"` and `hasContent === true` and `hydrated === true`

Run: `npm run test:e2e:core-funnel:ci`  
Expected: PASS.

---

### Task 5: G6 lite — Events freshness cue + improved empty state

**Files:**
- Modify: `src/app/(padded)/events/page.tsx`
- Modify: `messages/en.json` (+ locales if required by build)

- [ ] **Step 1: Add “Updated monthly” cue above the fold**

Best insertion point: within `ListPageHero` children, below existing CTA + note.

- [ ] **Step 2: Improve empty state recovery CTA**

When filtered list is empty, show:
- Calm note (“No events match these filters.”)
- A primary recovery CTA to “Browse places” or “Plan a day”

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run typecheck && npm run test && npm run build`  
Expected: PASS.

---

## Final verification

- [ ] Run: `npm run lint`
- [ ] Run: `npm run typecheck`
- [ ] Run: `npm run test`
- [ ] Run: `npm run build`
- [ ] Run: `npm run test:e2e:core-funnel:ci`


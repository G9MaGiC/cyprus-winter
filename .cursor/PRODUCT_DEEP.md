# Cyprus Winter — Product & domain kernel (for agents)

**Use this** as the shared “ground truth” when reasoning about the product, users, and stack. Pair with `PRD.md`, `README.md`, `.cursor/UX_PERSONA.md`, and `.cursor/skills/cyprus-tourism-app/SKILL.md`.

---

## 1. What the product is

- **Positioning:** A **curated, destination-only** winter guide and planning surface for Cyprus (Nov–Mar focus in the PRD; the app serves year-round content with a **winter-differentiated** story).
- **Job to be done:** Move visitors from **inspiration → shortlist → day-by-day plan → high-intent actions** (book a tasting, report trail conditions, use AI for discovery).
- **Not:** A generic OTA, not a summer-sun brochure site. **Trust** comes from curation, real places, a transparent curation method (/team), and consistent UX—not algorithmic noise.

**Core loop (revenue + engagement):** **Discover / Search / Trails / Events** → **Plan** (itinerary, templates) → **Book** (winery flows, `bookings`) → **return** (My Bookings, email sync, local storage merge).

**Secondary loops:** Trail **conditions** (community reports), **AI guide** (context from path + itinerary), **airport** (arrival stress reduction), **admin stats** (funnel + partner revenue for ops).

---

## 2. Who uses it (persona shorthand)

From `PRD.md`—keep these in mind for copy, UX, and features:

| Persona | Driver | Implication for the app |
|--------|--------|-------------------------|
| **Cultural Explorer** | Authenticity, pace, “no empty days” | Rich detail pages, Plan, wine/culture, clear “what’s open in winter” |
| **Active Adventurer** | Trail quality, conditions, safety | Troodos focus, reports, maps, honest difficulty/seasonality |
| **Digital Nomad** | Cost, WiFi, weekend exploration | Fast search, Plan for weekends, less fluff, scannable |
| **Winter Sun Family** | Value, reassurance, kid logistics | Family filter + template, accessibility notes, 2–3 stops/day pacing, indoor backups |
| **Local / Expat** | Rediscover home, “not tourist content” | `?filter=local` lane, `/events`, `/secrets`, Greek-first voice on `el` |
| **Bleisure** | Max value in minimal time | `/airport` → `short-stay` template, one-trail-one-village-one-evening plans |

All: **mobile-first**, often on **4G** at the airport or trailhead; **EUR**; **winter light and temperature** are differentiators vs home. Canonical detail + native-language experience standard per market: `docs/ICPS.md` (§6.1).

---

## 3. Business & trust

- **Partners:** Wineries and experience providers; **lead-fee** style metrics appear in admin stats when configured (`bookings.lead_fee_eur`, partner revenue aggregation).
- **Funnel:** `conversion_events` (e.g. page_view, discover_view, shop_click, plan_add, booking_*)—used for product analytics, not user shaming.
- **Bookings:** API + optional **Supabase** persistence; email lookup is **exact match**; **rate limits** on chat and bookings; **Resend** for notifications when configured.
- **AI:** Sanitized markdown output; context includes path and plan; **rate limited**; must not leak secrets or execute untrusted content.

---

## 4. Technical reality (this repo)

- **Framework:** **Next.js 16** (App Router), **React 19**, **Tailwind v4**, **next-intl** (locale routes under `/[locale]/` plus default paths). Locales: `en`, `el`, `de`, `pl`, `fr`, `he`, `ro` — all seven carry full native editorial (chrome and curated content, via the message-overlay layer in `src/lib/*-content.ts`). `fr`/`he`/`ro` keep the beta label only pending legal sign-off on privacy/terms (`src/i18n/routing.ts`).
- **Data:** **Primary source of truth** is **`src/data/`** (attractions, trails, wineries, events, `PlanItem`, templates, etc.)—typed, versioned in git.
- **Server data:** **Supabase** for bookings, conversion events, trail reports, etc., when env is set—**not** “static only.” Client features may use **localStorage** (plan, bookings merge) with clear hydration rules.
- **APIs:** `src/app/api/*`—**Zod** validation, `{ success, data?, error? }` style per project rules; **Upstash** (or in-memory) **rate limiting**.
- **Auth:** User auth patterns may exist for account flows; **admin** stats use `ADMIN_SECRET` and/or **HttpOnly session cookie** (`/api/admin/session`)—never store admin secret in public client long-term.
- **Mobile app path:** **Capacitor**—web is the main product; native is secondary.
- **Quality bar:** `npm run lint`, `typecheck`, `test`, `build`; Playwright e2e where applicable.

---

## 5. Design & voice (non-negotiables)

- **UX persona:** “Cyprus secret”—**premium, quiet, discovery-first** (see `UX_PERSONA.md`). **No** emoji in brand voice, no loud FOMO, no bargain-bin CTAs.
- **System:** `src/lib/design-tokens.ts` + `globals.css`—**terracotta** (primary action), **olive** (text), **golden** (on dark / accent), **aegean** (secondary nav/links/status), **sand** (surfaces). **44px** touch targets; **focus-visible** rings.
- **Copy:** Short, warm, place-specific (Troodos, Lefkara, Commandaria, LCA/PFO). **Plan** terminology is preferred over “itinerary” in user-facing UI (align with nav).

---

## 6. File map (when touching features)

| Area | Path(s) |
|------|---------|
| Plan / itinerary state | `src/hooks/useItinerary.ts`, `usePlanPage.ts`, `usePlanUrlActions.ts` |
| Funnel / analytics | `src/lib/funnel.ts`, `src/lib/analytics.ts`, `src/app/api/track` |
| Bookings | `src/lib/bookings.ts`, `src/app/api/bookings`, `src/app/(padded)/bookings` |
| AI | `src/components/AIAssistantWithBoundary.tsx` (dynamic import from `ClientComponents.tsx`), `src/app/api/chat` |
| SEO / meta | `layout.tsx`, page `metadata`, `src/lib/translated-page-meta.ts` (hub registry), `src/lib/locale-metadata-dynamic.ts` + `src/lib/locale-seo.ts` (localized dynamic routes), JSON-LD on the EN base |
| Admin | `src/app/api/stats`, `src/app/(padded)/admin/stats` |
| Grants / PRE-SEED | `GRANT_STRATEGY.md`, `GRANT_PITCH.md`, `docs/superpowers/plans/2026-08-20-preseed-grant-product-backlog.md` |

---

## 7. Seasonal & factual discipline

- **Winter:** Shorter days, cooler Troodos, **snow possible** on Olympus—never promise beach weather for hiking without nuance.
- **Cyprus specifics:** Left-hand traffic, **112** emergency, **EUR**, two main airports (**LCA**, **PFO**). Align copy with **`src/data`** and verified sources for events (don’t invent festival dates).

---

*Keep this file accurate when the product or stack changes.*

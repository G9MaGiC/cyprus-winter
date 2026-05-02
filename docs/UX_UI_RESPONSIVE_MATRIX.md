# UX/UI responsive matrix — Cyprus Winter

**Purpose:** Repeatable pass for **all viewports** and **all major surfaces** so layout, touch, and overlays stay correct on real devices.

**Pair with:** [`.cursor/TEAM_VISUAL_QA.md`](../.cursor/TEAM_VISUAL_QA.md), [`docs/USER_FLOWS_AZ.md`](USER_FLOWS_AZ.md), [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts) (`LAYOUT`, `BOTTOM_NAV`, `NAV_OFFSET`).

---

## 1. Viewport grid (test each)

| Label | Width | Height hint | Device class |
|-------|-------|-------------|--------------|
| **XS** | 320 | 568 | Small iPhone SE / tight Android |
| **SM** | 375 | 667 | iPhone 8/13 class — **primary mobile design target** |
| **MD** | 768 | 1024 | Tablet portrait |
| **LG** | 1024 | 768 | Tablet landscape / small laptop |
| **XL** | 1280+ | 800+ | Desktop |

**Also verify:** `env(safe-area-inset-*)` behavior using browser devtools device mode with notched devices (iPhone 14, etc.).

---

## 2. Global shell (every resolution)

- [ ] **Top:** Fixed nav does not overlap first heading; `pt-` / hero `heroContentTop` looks intentional.
- [ ] **Bottom (mobile only):** Content clears **bottom nav** — `main` uses `pb-[calc(4.5rem+env(safe-area-inset-bottom))]` pattern; no CTAs hidden behind nav.
- [ ] **Sticky bars:** Plan share strip, trail sticky actions, StickyPlanBar — no double focusable “Plan” (see BottomNav placeholder when sticky plan visible).
- [ ] **Overlays:** Onboarding, cookie, AI assistant — one blocking layer; focus trap; dismiss restores focus.
- [ ] **Touch:** Primary actions `min-h-[44px]` (or icon buttons with equivalent padding).

---

## 3. Page groups (spot-check at SM + LG minimum)

Run **SM + LG** for each group; run **320** if anything clips.

| Group | Representative routes | Responsive focus |
|-------|------------------------|------------------|
| **Core funnel** | `/`, `/discover`, `/discover/[id]`, `/plan`, `/search` | Filter chips wrap; cards grid; modals full-width on mobile |
| **Trails** | `/trails`, `/trails/[id]`, `/trails/[id]/report` | Map + section stack; long content scroll; form fields |
| **Book** | `/book/winery/[id]`, `/book/guide/[id]`, `/bookings` | Form layout; success state; empty vs list |
| **Arrival & misc** | `/airport`, `/events`, `/weather`, `/team` | Hero images; horizontal scroll sections (airport first hour) |
| **Account** | `/login`, `/register`, `/account` | Form width; errors visible |
| **System** | `not-found`, `error`, loading states | Match design system (`TEAM_VISUAL_QA`) |

**Locale routes:** Repeat spot-check for `/[locale]/…` for at least **el** and **en** — layout should match; text expansion must not break chips/buttons.

---

## 4. Breakpoint-specific issues

| Symptom | Typical cause |
|---------|----------------|
| Horizontal scroll | Fixed widths, negative margins, wide tables |
| Clipped hero CTAs | Missing safe-area or wrong `pt-` under nav |
| Tiny tap targets | Raw `<button>` or `<a>` without min height |
| Duplicate scroll | Nested `overflow-auto` in drawers |
| Modal under nav | z-index vs bottom nav / AI widget |

---

## 5. Automation vs manual

- **Automated:** `npm run lint`, `npm run test`, `npm run test:e2e:ci` (Playwright uses Chromium desktop; **not** a substitute for real narrow widths).
- **Manual:** Visual pass using §1 viewport grid + §3 checklist.

---

## 6. Reporting

Log issues in [`docs/QA_BUGS.md`](QA_BUGS.md) with: **viewport**, **route**, **screenshot or repro**, **severity P0–P2**.

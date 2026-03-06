# Cyprus Winter — Codebase Audit Report

**Date:** March 4, 2026  
**Scope:** Navigation & links, design system, data/content, architecture, PRD/README alignment  
**Updates:** March 5, 2026 — Admin protection, track rate limit, tests, typography, SearchBar, Plan flow, docs

---

## Summary

| Category           | Critical | High | Medium | Low |
|--------------------|----------|------|--------|-----|
| Navigation & links | 0        | 1    | 0      | 0   |
| Design system      | 0        | 1    | 0      | 1   |
| Data & content     | 0        | 0    | 1      | 1   |
| Architecture       | 0        | 0    | 1      | 0   |
| PRD/README gaps    | 0        | 1    | 2      | 0   |
| **Total**          | **0**    | **4**| **4**  | **2**|

---

## 1. Navigation & Links

| Issue | File:Line | Severity |
|-------|-----------|----------|
| Nav uses exact `pathname === link.href`; sub-routes (e.g. `/discover/nissi-beach`, `/trails/artemis`) do not highlight parent (Discover, Trails) | Nav.tsx:42, 56–58, 80, 146 | **High** |

**Detail:** When on `/discover/nissi-beach` or `/trails/artemis`, the main nav shows Discover/Trails as inactive. Users lose visual context that they are still in the Discover or Trails flow. Fix: use `pathname.startsWith(link.href)` (or equivalent) for parent-route highlighting, with care for `/` (home).

---

## 2. Design System

| Issue | File:Line | Severity |
|-------|-----------|----------|
| ~~PRD specifies Playfair Display; layout uses Fraunces~~ | layout.tsx | **Resolved** — PRD updated to Fraunces, Inter |
| Hex values only in design-tokens.ts and globals.css (no hardcoded hex in components) | — | **Low** ✓ |

**Detail:** PRD was updated to match implementation (Fraunces, Inter).

---

## 3. Data & Content

| Issue | File:Line | Severity |
|-------|-----------|----------|
| ~~Attraction `image` field~~ | attractions.ts | **Resolved** — Dead image values removed; type kept optional/deprecated; rendering uses `getAttractionImage()` |
| `combineWith` IDs not validated; orphaned IDs result in fewer links (no broken links). `getRelatedPlaces` silently skips unknown IDs | related-places.ts:11–34, data/*.ts | **Low** |

**Detail:** The `image` field was dead data. All image values have been removed from attraction entries; the type keeps `image` as optional and deprecated. Rendering uses `getAttractionImage(id, type)` exclusively.

---

## 4. Architecture

| Issue | File:Line | Severity |
|-------|-----------|----------|
| No duplicate logic found; data files are the single source of truth; server vs client component usage is appropriate | — | ✓ |
| README states "no backend/DB" but Supabase is used for bookings and trail reports | README.md:191, package.json:14 | **Medium** |

**Detail:** Supabase is in `package.json` and used in `src/lib/supabase.ts`, `src/app/api/bookings/`, `src/app/api/trail-reports/`, etc. README should be updated to reflect the database/backend.

---

## 5. PRD/README Gaps

| Issue | File:Line | Severity |
|-------|-----------|----------|
| README says "Data: Static TypeScript in src/data/ (no backend/DB)" — Supabase and APIs exist | README.md | **High** |
| ~~PRD typography~~ | — | **Resolved** — PRD aligned with Fraunces, Inter |
| README feature table omits Trails, Events, Discover filters, Trail reports, Winery booking from Discover | README.md:39–43 | **Medium** |

**Detail:** README feature table lists `/airport`, `/discover`, `/plan`, `/book/winery/[id]`, `/bookings`, `/account` but does not mention Trails, Events, trail reports, or Discover filter behavior.

---

## 6. Back Navigation

| Page | Back link | Status |
|------|-----------|--------|
| /discover/[id] | ← Back to Discover | ✓ |
| /trails/[id] | ← Back to Trails | ✓ |
| /trails/[id]/report | ← Back to Trails, Back to {trail} | ✓ |
| /book/winery/[id] | ← Back to {winery} | ✓ |
| List pages (discover, trails, plan, etc.) | PageHeader default ← Back (to /) | ✓ |

All sub-pages have appropriate back navigation.

---

## 7. Internal Link Validation

| Link type | Valid | Notes |
|-----------|-------|-------|
| /discover, /discover?filter=* | ✓ | filter IDs: beach, ancient, village, winery, monastery, nature→beach, wine→winery |
| /discover/[id] | ✓ | Resolved via `allAttractions` |
| /trails, /trails?difficulty=*, /trails?region=* | ✓ | |
| /trails/[id] | ✓ | Accepts both `id` and `slug` |
| /book/winery/[id] | ✓ | Resolved via `wineries` |
| /airport, /plan, /events, /bookings, /account, /team | ✓ | |

No broken internal links identified.

---

## 8. Recommendations

1. **Nav highlighting:** Use `pathname.startsWith(link.href)` (or similar) for parent routes — ✅ Done (Nav.tsx).
2. **README:** Add Supabase/backend, update feature table — ✅ Data/tech section updated.
3. **Typography:** PRD updated to match implementation (Fraunces, Inter) — ✅ Done.
4. **Attraction images:** `image` marked optional and deprecated; rendering uses `getAttractionImage(id, type)` — ✅ Done.
5. **combineWith validation:** Test added in `related-places.test.ts` to ensure all `combineWith` IDs resolve to valid places — ✅ Done.

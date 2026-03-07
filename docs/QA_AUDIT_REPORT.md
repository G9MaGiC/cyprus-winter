# Cyprus Winter — QA Audit Report

**Date:** March 7, 2026  
**Agent:** audit-explore  
**Refs:** docs/QA_PLAN.md, PRD.md, README.md, docs/QA_BUGS.md

---

## Executive Summary

- **Lint / Test / Build:** All pass
- **Security:** Booking lookup exact match ✓, Admin 401 ✓, AI sanitization ✓, trail reports Zod ✓
- **Broken links:** None found; major routes validated
- **PRD drift:** Typography, home screen architecture, roadmap alignment
- **Gaps:** API/E2E tests, Chat error message leakage, locale link consistency

---

## Category → Issue → File:Line → Severity

### Security

| Issue | File:Line | Severity |
|-------|-----------|----------|
| Chat API returns `err.message` in 500 responses; could leak internal details (e.g. "Invalid API key", Moonshot errors) in production | src/app/api/chat/route.ts:83-84 | **P2** |
| Production rate limiting relies on Upstash Redis; in-memory fallback per-instance on serverless (documented; acceptable) | src/lib/rate-limit.ts | P2 (known) |

### Functional / Links

| Issue | File:Line | Severity |
|-------|-----------|----------|
| No broken internal links found — `/discover`, `/plan`, `/trails`, `/airport`, `/weather`, `/bookings`, `/events`, `/secrets`, `/wineries`, `/wine-routes/*`, `/regions/*`, `/guides/troodos-december` all exist | — | — |
| Events hash links `/events#${e.id}` — all referenced event ids exist in winterEvents | src/app/weather/[month]/page.tsx:120 | — |

### PRD Drift

| Issue | File:Line | Severity |
|-------|-----------|----------|
| PRD §3.1 typography: "Body: Inter" vs actual Plus Jakarta Sans | PRD.md:233, layout.tsx:16 | **P2** |
| PRD §3.2 Winter Home: "Weather-first", "Trail status", "Mood-based navigation" vs current CategoryChips / EditorsPicks / ThisWeekGrid layout | PRD.md:243-270 | **P1** |
| PRD Phase 1 "25 winter attractions" — current allAttractions count exceeds 25; scope alignment unclear | PRD.md:548 | P2 |

### Consistency / Architecture

| Issue | File:Line | Severity |
|-------|-----------|----------|
| Locale-aware navigation: AIAssistant uses `@/i18n/navigation` Link; most pages use `next/link` with hardcoded paths — may break under locale routing (el, de, pl) | Multiple (layout, Nav, page links) | **P2** |
| Root layout vs [locale] layout — footer and structure duplicated; ensure canonical/main alternates correct | layout.tsx, [locale]/layout.tsx | P2 |
| nav `isActive` for Discover/Trails: `pathname.startsWith(href + "/")` — correct for `/discover/[id]`, `/trails/[id]` | src/lib/nav.ts:8 | — |

### Data / Schema

| Issue | File:Line | Severity |
|-------|-----------|----------|
| `getBookingsByEmail` uses `.eq("guest_email", emailNormalized)` — exact match ✓ | src/lib/bookings.ts:76-77 | — |
| Trail reports: Zod schema `status`/`surface` enums; 400 on invalid | src/app/api/trail-reports/route.ts:13-15 | — |

### Health / Ops

| Issue | File:Line | Severity |
|-------|-----------|----------|
| Health endpoint checks Supabase connectivity; reports ai, email (Resend), storage | src/app/api/health/route.ts | — |

### Test Coverage Gaps (from QA_PLAN §7)

| Area | Current | Severity |
|------|---------|----------|
| API routes | None | **P1** |
| Hooks (useItinerary) | None | P2 |
| E2E (Plan→Book, Discover→Detail) | None | P1 |

### Accessibility / Design (from QA_BUGS — residual)

| Issue | File:Line | Severity |
|-------|-----------|----------|
| Breadcrumbs, ContextualHelp min-h/touch — "manual retry if needed" per QA_BUGS | docs/QA_BUGS.md:186 | P2 |

---

## Verified OK

- **Lint:** `npm run lint` — 0 errors  
- **Tests:** 130 passed (14 files)  
- **Build:** 362 static pages, all API routes compiled  
- **Security:** Admin 401 without `ADMIN_SECRET`, booking exact match, AI `isSafeUrl` + sanitizeText, trail reports Zod  
- **Wine routes:** krasochoria, laona, akamas, commandaria — all in data + sitemap  
- **Regions:** troodos, paphos, ayia-napa, larnaca, limassol — `generateStaticParams`  
- **Weather months:** november–april — `generateStaticParams`  
- **EditorsPicks hrefs:** /discover/omodos, /discover/pafos-mosaics, /trails/artemis, /discover/kourion — all valid  

---

## Recommendations

1. **P0/P1:** None (no critical findings).
2. **P1:** Align PRD §3.2 with actual home screen or update PRD; add API route tests (POST /api/bookings, /api/chat, /api/trail-reports).
3. **P2:** Chat 500: use generic message in production; fix typography doc; unify locale Link usage; add E2E smoke tests.
4. **Backlog:** Lighthouse baseline (LCP, CLS); expand a11y (axe) coverage; hooks tests.

---

## Traceability

- Findings logged in this report  
- Add new bugs to docs/QA_BUGS.md per QA_PLAN §5  
- Re-run Phase A–F after fixes  

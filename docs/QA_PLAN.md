# Cyprus Winter — CTO QA Plan: Bug Discovery & Fix Prioritization

**Owner:** CTO / QA  
**Created:** March 2026  
**Purpose:** Systematic plan to find all bugs, document fixes, and reach launch-ready quality  
**Refs:** AUDIT_REPORT.md, PROJECT_REVIEW.md, ROADMAP.md, TECHNICAL.md  
**Winter 2026 persona pack:** `docs/QA_MARKET_CONTEXT_WINTER_2026.md`, `docs/QA_PERSONAS_FULL_STACK_2026.md`, `docs/QA_PERSONA_JOURNEYS_2026.md`, `docs/QA_PERSONA_PRIORITIES_2026.md`

---

## 1. Objectives

1. **Find** all functional, security, accessibility, and UX bugs before Nov 2026 launch  
2. **Document** every issue with severity, reproduction steps, and fix status  
3. **Prioritize** fixes by impact (critical → high → medium → low)  
4. **Verify** no regressions after fixes and polish sprints  

---

## 2. Bug-Finding Strategy

### 2.1 Automated Checks (Run First)

**E2E prerequisites (first clone / clean machine):** Playwright does not ship browser binaries with `npm ci`. Before running any Playwright command, run **`npm run test:e2e:install`** (installs Chromium for desktop and mobile-viewport projects). If you see `browserType.launch: Executable doesn't exist`, run that script. Linux CI uses `playwright install --with-deps chromium` in `.github/workflows/ci.yml`; local Linux may need system deps (`npx playwright install-deps`). Full E2E (`test:e2e:ci`) installs all browsers including WebKit.

**Corporate firewall / VPN (local dev only):** `npx playwright install` must reach Playwright’s browser CDN over **HTTPS (443)**. Allow outbound access to at least:

- `cdn.playwright.dev` — primary browser archive CDN (see [Playwright: Install behind a firewall or a proxy](https://playwright.dev/docs/browsers#install-behind-a-firewall-or-a-proxy))
- `storage.googleapis.com` — **Chrome for Testing / headless shell** bundles are often fetched from paths under `chrome-for-testing-public` (same install step; observed when the CDN mirrors or falls back)

Hosts and exact URLs can change between Playwright releases; if allowlisting is strict, re-check after upgrades or use `PLAYWRIGHT_DOWNLOAD_HOST` / an internal mirror per upstream docs. **CI:** GitHub Actions already runs `npx playwright install --with-deps chromium` (core funnel) and `npx playwright install --with-deps` (full E2E) in `.github/workflows/ci.yml` — no workflow change required for this allowlist; it applies to locked-down developer machines and self-hosted runners behind a firewall.

| Check | Command | Coverage | Notes |
|-------|---------|----------|-------|
| **Lint** | `npm run lint` | Style, unused vars, imports | Fix all before manual QA |
| **Tests** | `npm run test` | 175+ unit tests: format, booking-schema, related-places, data, search, API routes, sanitize, rate-limit | |
| **E2E** | `npm run test:e2e` (dev) or `npm run test:e2e:ci` | Discover→Detail flow | Playwright; add Plan, Bookings flows |
| **E2E gate (CI)** | `npm run test:e2e:gate:ci` | Core funnel + UX specs (`hub-footer`, `overlay-precedence`, `discover-detail`) | Runs in Core Funnel Gate job |
| **Build** | `npm run build` | Compile, SSG/SSR, routing | Must pass; prebuild catches `.next` ownership |
| **Typecheck** | `npx tsc --noEmit` | Type errors | Add to CI if not already |
| **API stress** | `npm run stress:api` | Rate limits, error handling | Verify chat + bookings under load |

### 2.2 Security & Data Integrity

| Area | Test | Expected |
|------|------|----------|
| **Booking lookup** | `GET /api/bookings?email=user@example.com` | Exact match only; no substring/ILIKE |
| **Chat rate limit** | Send 20+ requests/min (prod) or 60+ (dev) from same IP | 429 after limit |
| **Bookings rate limit** | Submit 10+ bookings/min (POST) or 15+ lookups/min (GET) | 429 |
| **Trail reports** | Submit invalid status/surface | 400 + Zod validation error |
| **AI output** | Ask for `<script>alert(1)</script>` or markdown with `javascript:` | Sanitized; no execution |
| **Resend email** | Booking with name `"><img src=x>` | Escaped; no injection |
| **Admin stats** | `GET /api/stats` without `ADMIN_SECRET` | 401 |

### 2.3 Functional Flow Testing (Manual)

| Flow | Steps | Risk Areas |
|------|-------|------------|
| **Discover → Detail** | Home → Discover → filter → card → detail | Invalid `?filter=`, invalid `[id]`, related links |
| **Trails → Detail → Report** | Trails → filter → trail → Report conditions | Invalid trail id, submit, validation |
| **Plan → Add → Book** | Plan → add winery → Book tasting → submit | `?add=` param, localStorage sync, form validation |
| **Bookings sync** | Submit winery booking → Bookings page → enter email | Email exact match, empty state, loading |
| **AI chat** | Open → type/speak → suggestions → retry on error | Focus trap, safe area, rate limit UX |
| **Search** | Nav → Search → query → results | Empty query, no results, links |
| **Airport** | Arriving page, transport, tips | Content accuracy, links |
| **Hub footer → Ask AI** | Beaches (or other hub) footer → Ask AI | `e2e/hub-footer.spec.ts`; Cyprus Guide dialog opens after cookie/onboarding dismissed |
| **UX funnel footer parity** | Hubs use `HubFooter` (Plan + Ask AI); discover/trail detail use `DetailActionFooter` (Navigate + Add to plan + Ask AI) | `docs/UX_PATTERNS.md`; sticky place bars respect `footer-sentinel` |

### 2.4 Edge Cases & Error Paths

| Scenario | Action | Expected |
|----------|--------|----------|
| **Invalid attraction id** | `/discover/invalid-id-12345` | 404, not-found page, emergency numbers |
| **Invalid trail id** | `/trails/invalid-slug` | 404 |
| **Invalid winery id** | `/book/winery/fake` | 404 |
| **AI 503** | MOONSHOT_API_KEY missing | Friendly error, no stack trace in response |
| **AI 429** | Rate limited | "Try again later" message |
| **Supabase down** | DB unreachable | Health endpoint fails; bookings/trail reports degrade gracefully |
| **Resend failure** | Invalid API key | Booking still saved; user notified or log only |
| **Empty itinerary** | Plan with no items | Empty state, "Add places" CTA |
| **PlacePicker empty** | Search "zzzzz" in Plan | "No places in this category yet" |

### 2.5 Accessibility (WCAG 2.5)

| Check | Tool / Method | Priority |
|-------|---------------|----------|
| **Contrast** | axe DevTools, Lighthouse | P0 |
| **Focus order** | Tab through all interactive elements | P1 |
| **Screen reader** | VoiceOver (iOS) / NVDA (Win) on key flows | P1 |
| **Touch targets** | 44×44px min; 48px for primary CTAs | P1 |
| **Labels** | All inputs have label or aria-label | P1 |
| **Section labels** | aria-labelledby on major sections | P2 |
| **Skip link** | Focus skip link → lands on main | P2 |

### 2.6 Mobile & Responsive

**Extended checklist (page groups + 320px):** [`docs/UX_UI_RESPONSIVE_MATRIX.md`](UX_UI_RESPONSIVE_MATRIX.md).

| Device | Viewport | Checks |
|--------|----------|--------|
| **iPhone SE** | 375×667 | Hero, BottomNav, floating AI button above nav, safe area |
| **iPhone 14 Pro** | 393×852 | Notch; horizontal safe area on all pages |
| **Android (mid)** | 412×915 | Same as above |
| **iPad** | 768×1024 | Nav layout, no BottomNav, card grids |
| **Desktop** | 1280×720 | Full layout, no overlap |

**Specific mobile checks:**

- Floating AI button does not overlap BottomNav
- Mood pills horizontal scroll without layout shift
- FilterChips wrap; active chip visible
- Plan day tabs scroll horizontally
- PlacePicker scroll area works; no double-scroll
- AI panel full-screen on mobile; input above keyboard
- Forms (winery booking, bookings email) usable on small screens

### 2.7 Performance

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **LCP** | < 2.5s | Lighthouse |
| **FID / INP** | < 100ms | Lighthouse, web vitals |
| **CLS** | < 0.1 | Lighthouse |
| **TTI** | < 3s on 4G | Lighthouse (mobile) |
| **Bundle size** | No obvious bloat | Next.js build output |

---

## 3. Risk Areas (From Audits)

| Risk | Source | Mitigation |
|------|--------|------------|
| `combineWith` orphan IDs | AUDIT_REPORT | Low; getRelatedPlaces skips unknown IDs; validate data |
| Resend failures swallowed | PROJECT_REVIEW | Ensure booking still saved; log error; consider user notice |
| Health endpoint doesn't check Supabase/Resend | PROJECT_REVIEW | Extend health check; document behavior |
| Chat API stack traces in dev | PROJECT_REVIEW | Ensure prod hides stack traces |
| localStorage + Supabase merge | PROJECT_REVIEW | Manual test of sync; document edge cases |
| Nav parent-route highlighting | AUDIT_REPORT | Verify `pathname.startsWith` for Discover, Trails |

### Recurring checks (from QA cycles)

- **Hero/nav links** — HomeHero, nav items: verify href targets exist (/plan, /discover, /airport, etc.)
- **combineWith IDs** — related-places.test.ts validates attractions, trails, wineries, restaurants; no orphan IDs
- **BackLink/PageHeader** — New pages use BackLink or PageHeader for back navigation; no plain "← Back" links
- **Rate limiting** — Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for production; in-memory fallback when unset

---

## 4. Execution Checklist

### Phase A — Automated (Day 1)

- [ ] `npm run lint` — zero errors  
- [ ] `npm run test` — all pass  
- [ ] `npm run build` — success  
- [ ] `npm run test:e2e:ci` — E2E pass (optional, ~35s)  
- [ ] `npx tsc --noEmit` — no type errors  
- [ ] `npm run stress:api` — rate limits behave as expected  
- [ ] Lighthouse (mobile + desktop) — record baseline scores  

### Phase B — Security (Day 2)

- [ ] Booking lookup exact match  
- [ ] Chat + bookings rate limits  
- [ ] AI output sanitization (XSS)  
- [ ] Resend email escaping  
- [ ] Admin stats 401 without secret  

### Phase C — Functional (Days 3–4)

- [ ] All flows in §2.3 pass  
- [ ] All edge cases in §2.4 handled  
- [ ] 404 for invalid ids (discover, trails, winery)  

### Phase D — Accessibility (Day 5)

- [ ] axe / Lighthouse a11y — zero critical  
- [ ] Focus order, labels, touch targets  
- [ ] Skip link works  

### Phase E — Mobile (Day 6)

- [ ] All viewports in §2.6  
- [ ] Safe area, no overlap, scroll behavior  

### Phase F — Regression (Day 7)

- [ ] Re-run automated checks after any fixes  
- [ ] Smoke test key flows again  

---

## 5. Bug Report Template

```markdown
## [BUG-XXX] Short title

**Severity:** Critical | High | Medium | Low
**Area:** Security | Functional | A11y | Mobile | Performance
**Page/Component:** e.g. /plan, AIAssistant, PlacePicker

### Reproduction
1. Step 1
2. Step 2
3. Step 3

### Expected
What should happen.

### Actual
What happens.

### Environment
Browser, viewport, device (if relevant)

### Fix status
Open | In progress | Fixed | Won't fix
```

---

## 6. Fix Prioritization

| Severity | Criteria | SLA |
|----------|----------|-----|
| **Critical** | Security, data loss, app crash, P0 a11y | Fix before launch |
| **High** | Core flow broken, wrong data shown, P1 a11y | Fix in 1 sprint |
| **Medium** | Minor flow issue, cosmetic, P2 a11y | Fix in 2 sprints |
| **Low** | Polish, edge case, docs | Backlog |

---

## 7. Test Coverage (current) + gaps

| Area | Current | Recommended |
|------|---------|-------------|
| **API routes** | bookings, chat, trail-reports, health | Add coverage if routes expand (admin/session, stats, track, right-now) |
| **Hooks** | useItinerary (`src/hooks/useItinerary.test.tsx`: jsdom, mocked `useSearchParams`, clipboard + `storage` events) | Extend if hook grows |
| **Data helpers** | related-places, data/index, format, sanitize | — |
| **E2E** | Playwright: Discover→Plan (`e2e/discover-plan.spec.ts`), Home smoke (`e2e/home-smoke.spec.ts`) | Add Plan→Book flow; add locale smoke; keep selectors robust |

---

## 8. Winter 2026 persona QA pack

Use alongside phases A–F for market-grounded manual QA and backlog prioritization.

| Doc | Use when |
|-----|----------|
| [QA_MARKET_CONTEXT_WINTER_2026.md](./QA_MARKET_CONTEXT_WINTER_2026.md) | Arrivals mix, locale gaps, trust/crisis context |
| [QA_PERSONAS_FULL_STACK_2026.md](./QA_PERSONAS_FULL_STACK_2026.md) | Pick 2–3 personas per release; full-stack critique checklist |
| [QA_PERSONA_JOURNEYS_2026.md](./QA_PERSONA_JOURNEYS_2026.md) | Scripted steps, viewport matrix, Playwright mapping, release gate |
| [QA_PERSONA_PRIORITIES_2026.md](./QA_PERSONA_PRIORITIES_2026.md) | RICE-scored product backlog from persona themes |

**Per release:** Run the release gate in `QA_PERSONA_JOURNEYS_2026.md` + automated suite (§2.1). Tag bugs with persona ID in `docs/QA_BUGS.md`.

---

## 9. Traceability

- **Bugs:** Log in GitHub Issues or docs/QA_BUGS.md  
- **Fixes:** Reference bug ID in commit message  
- **Sign-off:** CTO/QA sign-off before launch (Tier 3 completion)  

# Cyprus Winter — CTO QA Plan: Bug Discovery & Fix Prioritization

**Owner:** CTO / QA  
**Created:** March 2026  
**Purpose:** Systematic plan to find all bugs, document fixes, and reach launch-ready quality  
**Refs:** AUDIT_REPORT.md, PROJECT_REVIEW.md, ROADMAP.md, TECHNICAL.md

---

## 1. Objectives

1. **Find** all functional, security, accessibility, and UX bugs before Nov 2026 launch  
2. **Document** every issue with severity, reproduction steps, and fix status  
3. **Prioritize** fixes by impact (critical → high → medium → low)  
4. **Verify** no regressions after fixes and polish sprints  

---

## 2. Bug-Finding Strategy

### 2.1 Automated Checks (Run First)

| Check | Command | Coverage | Notes |
|-------|---------|----------|-------|
| **Lint** | `npm run lint` | Style, unused vars, imports | Fix all before manual QA |
| **Tests** | `npm run test` | 22 tests: format, booking-schema, related-places, data, search | Expand coverage for API routes, hooks |
| **Build** | `npm run build` | Compile, SSG/SSR, routing | Must pass; prebuild catches `.next` ownership |
| **Typecheck** | `npx tsc --noEmit` | Type errors | Add to CI if not already |
| **API stress** | `npm run stress:api` | Rate limits, error handling | Verify chat + bookings under load |

### 2.2 Security & Data Integrity

| Area | Test | Expected |
|------|------|----------|
| **Booking lookup** | `GET /api/bookings?email=user@example.com` | Exact match only; no substring/ILIKE |
| **Chat rate limit** | Send 60+ requests/min from same IP | 429 after limit |
| **Bookings rate limit** | Submit 15+ bookings/min | 429 |
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

---

## 4. Execution Checklist

### Phase A — Automated (Day 1)

- [ ] `npm run lint` — zero errors  
- [ ] `npm run test` — all pass  
- [ ] `npm run build` — success  
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

## 7. Test Coverage Gaps (Recommended Additions)

| Area | Current | Recommended |
|------|---------|-------------|
| **API routes** | None | POST /api/bookings, POST /api/chat, POST /api/trail-reports |
| **Hooks** | None | useItinerary (add, remove, template, clear) |
| **Data helpers** | related-places, data/index | getPlaceById, getAttractionById, isWinery |
| **E2E** | None | Playwright: Plan→Book flow, Discover→Detail |

---

## 8. Traceability

- **Bugs:** Log in GitHub Issues or docs/QA_BUGS.md  
- **Fixes:** Reference bug ID in commit message  
- **Sign-off:** CTO/QA sign-off before launch (Tier 3 completion)  

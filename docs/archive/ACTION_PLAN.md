**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Action Plan — March 2026

**Ref:** ROADMAP.md, USER_FLOWS_AZ.md  
**Focus:** Near-term priorities after recent polish (bookings, trails, hero, flows).

---

## Recently completed

| Item | Details |
|------|---------|
| Bookings page | Redesign with stats, grouping (Upcoming / Past), status badges, days until, collapsible email sync |
| Trails page | Redesign with Best right now, grouped by status, improved cards, winter tips, report CTA |
| Hero image | Switched to cyprus-ancient-kourion.jpg |
| User flows | Proposed trails/wineries from choices; Add to itinerary wired; Related places Add + |
| Scroll to top | ScrollToTop on route change |
| Home Quick start | Added Dómes Sergiou winery card |
| Home copy | Tighter text and spacing |

---

## Recommended next steps (priority order)

### 1. Manual QA pass
- [ ] Run through USER_FLOWS_AZ.md checklist in browser
- [ ] Mobile: touch targets, scroll, bottom nav
- [ ] Add to itinerary → Plan → Suggested for day
- [ ] Trail report and winery booking form submission

### 2. Partner outreach (Tier 3) — manual
- [ ] Confirm 5–7 wineries/partners by Nov launch
- [ ] Dómes Sergiou: verify booking flow end-to-end
- [ ] Document partner onboarding

### 3. Content & SEO
- [ ] Content audit sign-off (docs/CONTENT_AUDIT.md)
- [ ] Meta tags and Open Graph for main routes
- [ ] "Escape the Cold" campaign assets

### 4. Phase 2 prep (optional)
- [ ] Trail conditions: identify source for live data (CMS, Forestry, crowd)
- [ ] Group hike / gamification: refine scope

---

## Quick wins

| Task | Effort | Impact | Status |
|------|--------|--------|--------|
| Add loading.tsx for bookings page | Low | Consistency | ✅ Done |
| Verify all secret-gems href resolve | Low | No dead links | ✅ Done |
| Test search with 2+ chars | Low | Core flow | ✅ Tests pass |
| Account page: wire sign-in (if ready) | Medium | Cross-device sync | Pending |

---

## Timeline

```
Now              Week 1–2           Week 3–4           Nov 1
├─ Manual QA     ├─ Partner outreach├─ Campaign prep   └─ Launch
│                ├─ Content sign-off│
│                └─ Quick wins      └─ Final polish
```

---

## Traceability

- **ROADMAP.md** — Full product roadmap
- **USER_FLOWS_AZ.md** — Flow verification checklist
- **QA_PLAN.md** — QA execution process

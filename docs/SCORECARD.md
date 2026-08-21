# Cyprus Winter — Engineering scorecard (5/5 criteria)

Target state for launch readiness. Re-run checks after major releases.

| Dimension | 5/5 criteria | Verify | Status (2026-08-21) |
|-----------|----------------|--------|---------------------|
| **Product clarity** | PRD-aligned funnel; winter-differentiated copy in `src/data` | `.cursor/PRODUCT_DEEP.md`, editorial review | **4.5/5** — funnel solid; ~55 winery heroes still regional/generic |
| **Core funnel** | Discover → Plan → Book E2E green; Plan server shell + client leaf | `npm run test:e2e:gate:ci`, `src/app/(padded)/plan/page.tsx` | **5/5** — E2E gate 23 passed locally post design train |
| **Security** | Upstash + Supabase in prod; AI paths validated; admin HttpOnly session | Public `curl /api/health` → `productionReady`; Bearer `HEALTH_SECRET` for `productionChecks`; `resolve-internal-path.test.ts` | **4.5/5** — chat/search hardened (BUG-122–124); admin cookie session shipped (DR-003); Upstash must still be verified in prod |
| **Test & CI** | lint, typecheck, 600+ unit tests, E2E gate, build | `.github/workflows/ci.yml` | **5/5** — 645 unit tests; build green on `b8729f2`; Actions on Node 20.19.0 |
| **i18n / SEO** | 7 locales validate; scan clean; hreflang for all locales | `npm run i18n:validate`, `npm run i18n:scan --fail`, `npm run build` | **5/5** — 2102 keys × 7; PWA install prompt i18n (BUG-253) |
| **Data maintainability** | `npm run data:validate`; audit tests; no shadow duplicate place IDs | CI quality job + discover data audit tests | **5/5** |
| **Mobile / Capacitor** | Documented remote URL strategy + error path | `docs/RUNBOOK.md` §5–6, `capacitor.config.ts` | **4.5/5** — sticky Plan/overlay model improved (BUG-127–134) |
| **Merge hygiene** | Single PR per feature; CI green on GitHub before merge | PR checklist in `AGENTS.md` | **5/5** |

**Overall: 4.6/5** — launch-ready after P0 ops (`docs/LAUNCH_CHECKLIST.md`).

---

## Verification commands

```bash
npm run lint && npm run typecheck && npm run test
npm run i18n:validate && npm run i18n:scan --fail
npm run data:validate && npm run build
npm run test:e2e:gate:ci
```

## Production readiness

```bash
curl -s https://<your-domain>/api/health | jq '{ ok, productionReady }'
curl -s https://<your-domain>/api/health \
  -H "Authorization: Bearer ${HEALTH_SECRET}" \
  | jq '{ ok, productionReady, productionChecks }'
```

Required: `UPSTASH_REDIS_REST_*`, Supabase URL + service role key.

---

## Recent remediation (reference)

| Range | Theme |
|-------|--------|
| BUG-122–124 | Search back-context, trail i18n, chat path validation |
| BUG-125–132 | Images, book SmartBackLink, sticky Plan hubs, events/breadcrumb i18n |
| BUG-133–136 | Auth password i18n, plan overlay, Discover Right Now, winery images |
| BUG-137–142 | CTO integration: brand refresh, production hardening, OSM CSP, locale book list |
| BUG-143–145 | `/skills` slash command, signed booking lookup tokens, GitHub Actions Node 24 runtime |
| BUG-146 | First-party funnel analytics no longer require marketing-cookie consent |
| BUG-147 | Beta locale chrome (`fr`/`he`/`ro` nav/footer/errors) + switcher beta label |
| `0fe7dcf` | E2E plan-book + Core Funnel green after rebase train |
| BUG-155 | Production health: public `productionReady`; annex checks only with `HEALTH_SECRET` |
| BUG-232–241 | UX/UI QA: sticky sand bars (`STRIP.stickySandBar`), touch targets, i18n on plan/navigate/remove badges |
| BUG-242 | Events loading sticky filter skeleton + `ListPageWidgetStrip` required i18n `ariaLabel` |
| BUG-243 | Trails loading hero + sticky filter skeleton aligned with live page (`STRIP.stickySandBar`) |
| BUG-244 | Plan loading hero + sticky day-selector skeleton aligned with `DaySelector` |
| BUG-245 | `STRIP.stickyBottomBar` token for `PlanStickyAddBar` (no inline `bg-background/98`) |

Details: `docs/QA_BUGS.md`

---

## Related docs

- `docs/LAUNCH_CHECKLIST.md` — one-page pre-launch ops gate
- `GRANT_STRATEGY.md` — PRE-SEED/0526 (deadline 11 Sep 2026) and tourism-grant map
- `docs/WINERY_IMAGE_INTAKE.md` — partner photo workflow
- `docs/RUNBOOK.md` — incidents and env matrix
- `docs/DEEP_REVIEW_2026-05-20.md` — security backlog (DR-*)

Last updated: 2026-08-21.

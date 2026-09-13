# Cyprus Winter — Engineering scorecard (5/5 criteria)

Target state for launch readiness. Re-run checks after major releases.

| Dimension | 5/5 criteria | Verify | Status (2026-08-24) |
|-----------|----------------|--------|---------------------|
| **Product clarity** | PRD-aligned funnel; winter-differentiated copy in `src/data` | `.cursor/PRODUCT_DEEP.md`, editorial review | **4.5/5** — funnel solid; partner tasting-room photos still ops-gated (~55 venues) |
| **Design system** | Tokens, motion, card/chrome primitives; CI guards | `docs/DESIGN_SUPER_BRIEF.md`, `design-tokens.test.ts` | **5/5** — sprint A–F + `HOME`/`HUB` grid tokens (PRs #157–#158); PR #199: modal CTA tokens, AI-drawer focus rings, single marker convention |
| **Core funnel** | Discover → Plan → Book E2E green; Plan server shell + client leaf | `npm run test:e2e:gate:ci`, `src/app/(padded)/plan/page.tsx` | **5/5** — E2E gate incl. visual QA (375/768/RTL) + hero load checks |
| **Security** | Upstash + Supabase in prod; AI paths validated; admin HttpOnly session | Public `curl /api/health` → `productionReady`; Bearer `HEALTH_SECRET` for `productionChecks`; `resolve-internal-path.test.ts` | **4.5/5** — chat/search hardened (BUG-122–124); admin cookie session shipped (DR-003); Upstash must still be verified in prod |
| **Test & CI** | lint, typecheck, 600+ unit tests, E2E gate, build | `.github/workflows/ci.yml` | **2/5** — extensive local gates exist, but GitHub Actions is blocked by BUG-347 and recent runs terminate with `startup_failure` before jobs begin |
| **i18n / SEO** | 7 locales validate; scan clean; hreflang for all locales | `npm run i18n:validate`, `npm run i18n:scan --fail`, `npm run build` | **5/5** — 2310 keys × 7; tier-1 de/el/pl complete (PRs #186–#189); PR #199: `he` brand typefaces + logical-properties RTL sweep, guest emails localized ×7; graduate badge after lawyer review |
| **Data maintainability** | `npm run data:validate`; audit tests; no shadow duplicate place IDs | CI quality job + discover data audit tests | **5/5** |
| **Mobile / Capacitor** | Documented remote URL strategy + error path | `docs/RUNBOOK.md` §5–6, `capacitor.config.ts` | **4.5/5** — sticky Plan/overlay model improved (BUG-127–134) |
| **Merge hygiene** | Single PR per feature; CI green on GitHub before merge | PR checklist in `AGENTS.md` | **5/5** |

**Overall: 3.9/5** — strong code foundation, but not launch-ready until GitHub Actions is restored, production health is green, real partners are connected, and public trust content is verified.

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
| BUG-155 | Production health: public `productionReady`; annex checks only with `HEALTH_SECRET` |
| BUG-232–245 | UX/UI QA: sticky sand bars, loading skeleton parity, bottom bar tokens |
| BUG-265–278 | QA sweep: weather footers, HubFooter AI guard, trail metadata, hub links, E2E |
| Design sprint | PRs #150–#155: tokens, cards, home calm, chrome, visual QA gate, photography trust |
| PR #157 | Main hub visual token pass — `HOME`/`HUB`, footer rhythm, book card media, skeleton parity |
| PR #158 | Secondary hub card grids — villages, beaches, wine-routes, regions, plan quick-start |
| PR #159 | Launch doc hygiene + root loading skeleton tokens |
| PR #164 | Plan copy hygiene pass 2 — residual itinerary → plan (BUG-305) |
| PR #168 | Plan template i18n — de/el/pl + beta fr/he/ro planQuick & home templates (BUG-307/308) |
| PR #170 | Beta editorial map sync — fr/he/ro home/book chrome without plan regression (BUG-309) |
| PR #172 | Trail metadata difficulty i18n — `trails.badges` namespace (BUG-310) |
| PR #174 | Beta plan funnel i18n — combos, banners, home titles (BUG-311) |
| PR #176 | Beta soft-gap i18n — home footer, place picker, bookings page, day combos (BUG-312) |
| PR #178 | Funnel i18n polish — error/airport/trails/plan meta all locales (BUG-313) |
| PR #179 (merged) | Beta chrome batch 2–17 + holdouts doc + editorial drift gate — fr/he/ro chrome complete (BUG-314–331) |
| PR #181 (merged) | CI Quality: `i18n:editorial-drift` (BUG-332) |
| PR #182 (merged) | Beta editorial quality — HE/FR/RO native polish; expanded editorial maps (BUG-333) |
| PR #183 (merged) | Beta legal — privacy + terms body fr/he/ro (BUG-334, pending lawyer review) |
| PR #184 (merged) | Beta graduation checklist + `npm run i18n:beta-readiness` (BUG-335) |
| PR #185 (merged) | Post-beta docs hygiene — grant WP3 + CI readiness (BUG-336) |
| PR #186 (merged) | Tier-1 book SEO meta de/el/pl + holdouts/docs sync (BUG-337) |
| PR #187 (merged) | Tier-1 nature hub + Ask AI chrome + guides languages (BUG-338) |
| PR #188 (merged) | Tier-1 trail meta + secrets/events polish (BUG-339) |
| PR #189 (merged) | Tier-1 discover/trails/account polish (BUG-340) — tier-1 de/el/pl complete |

Details: `docs/QA_BUGS.md`

---

## Related docs

- `docs/LAUNCH_CHECKLIST.md` — one-page pre-launch ops gate
- `docs/DESIGN_SUPER_BRIEF.md` — design sprint north star + polish scorecard
- `GRANT_STRATEGY.md` — PRE-SEED/0526 (deadline 11 Sep 2026) and tourism-grant map
- `docs/WINERY_IMAGE_INTAKE.md` — partner photo workflow
- `docs/RUNBOOK.md` — incidents and env matrix
- `docs/DEEP_REVIEW_2026-05-20.md` — security backlog (DR-*)

Last updated: 2026-09-13.

# Cyprus Winter — Engineering scorecard (5/5 criteria)

Target state for launch readiness. Re-run checks after major releases.

| Dimension | 5/5 criteria | Verify |
|-----------|----------------|--------|
| **Product clarity** | PRD-aligned funnel; winter-differentiated copy in `src/data` | `.cursor/PRODUCT_DEEP.md`, editorial review |
| **Core funnel** | Discover → Plan → Book E2E green; Plan server shell + client leaf | `npm run test:e2e:gate:ci`, `src/app/(padded)/plan/page.tsx` |
| **Security** | Upstash + Supabase in prod; AI paths validated; admin HttpOnly session | `curl /api/health` → `productionReady`; `resolve-internal-path.test.ts` |
| **Test & CI** | lint (0 warnings), typecheck, 560+ unit tests, E2E gate (12 specs), build | `.github/workflows/ci.yml` |
| **i18n / SEO** | 7 locales validate; scan clean; hreflang for all locales | `npm run i18n:validate`, `npm run i18n:scan --fail`, `npm run build` |
| **Data maintainability** | `npm run data:validate`; audit tests; no shadow duplicate place IDs | CI quality job + `discover-data-audit.test.ts`, `itinerary-templates.test.ts` |
| **Mobile / Capacitor** | Documented remote URL strategy + error path | `docs/RUNBOOK.md` §5–6, `capacitor.config.ts` |
| **Merge hygiene** | Single PR per feature; CI green on GitHub before merge | PR checklist in `AGENTS.md` |

Last updated: 2026-05-29.

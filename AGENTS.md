# Cyprus Winter — AI Agent Coordination

**App path:** This repository root (`cyprus-winter/`). The parent monorepo may contain other stacks; this file applies to the Next.js tourism app here.

## Project Snapshot

- **What**: Winter tourism marketplace for Cyprus (trails, wineries, villages, plan/book funnel)
- **Stack**: Next.js 16 (App Router), React 19, Tailwind, next-intl, Vitest, Playwright
- **Default dev**: `npm run dev` → http://localhost:3000

## Key paths

| Area | Path |
|------|------|
| Pages | `src/app/(padded)/`, `src/app/_home/` |
| Data | `src/data/` |
| i18n | `messages/{en,el,de,pl,ro,fr,he}.json`, `src/i18n/routing.ts` (7 locales; `he` RTL) |
| API | `src/app/api/` |
| Design tokens | `src/lib/design-tokens.ts` |
| QA | `docs/QA_PLAN.md`, `docs/QA_BUGS.md`, `docs/LAUNCH_CHECKLIST.md` |
| Product | `.cursor/PRODUCT_DEEP.md`, `.cursor/skills/cyprus-tourism-app/SKILL.md` |

## Standards

- **i18n**: No hardcoded user-facing strings in components; `getTranslations` (server) or `useTranslations` (client). Run `npm run i18n:scan --fail` in CI.
- **RSC**: Do not pass `Link` or `t` across server/client boundaries; use `*-data.ts` loaders + `*View.tsx` client leaves for home sections.
- **Hub footers**: Use `HubFooter` via page-specific `*Footer.tsx` clients — see `docs/UX_PATTERNS.md`.
- **Rate limits**: Production requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (see `src/lib/rate-limit.ts`).

## Quick commands

```bash
npm run lint
npm run typecheck
npm run test
npm run i18n:validate
npm run i18n:scan --fail
npm run data:validate
npm run build
npm run test:e2e:gate:ci
```

See `docs/SCORECARD.md` for 5/5 launch criteria.

## Agent workflows (Superpowers)

| Intent | Use |
|--------|-----|
| Execute a plan | `/execute-plan` → reads `executing-plans` skill; plans live in `docs/superpowers/plans/` |
| Write a plan | Ask agent to use `writing-plans` skill |
| Brainstorm feature | Ask agent to use `brainstorming` skill |

The deprecated Superpowers plugin `/execute-plan` stub is overridden by `.cursor/commands/execute-plan.md` in this repo.

## Before merging

1. Lint, typecheck, unit tests, i18n validate/scan, **data:validate**, build
2. E2E gate if touching funnel, overlays, or hub footers
3. Log regressions in `docs/QA_BUGS.md`

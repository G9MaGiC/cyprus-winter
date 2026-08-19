# CLAUDE.md — Cyprus Winter

Use this file as the Claude Code entry point. Canonical product and agent docs live elsewhere and stay current:

| Doc | Use for |
|-----|---------|
| [AGENTS.md](AGENTS.md) | Stack, paths, i18n/RSC rules, merge gates |
| [`.cursor/PRODUCT_DEEP.md`](.cursor/PRODUCT_DEEP.md) | Funnel, personas, trust, technical map |
| [`.cursor/skills/cyprus-tourism-app/SKILL.md`](.cursor/skills/cyprus-tourism-app/SKILL.md) | Design tokens, UX persona, implementation patterns |
| [`.cursor/TEAM_APP_EXPERTS.md`](.cursor/TEAM_APP_EXPERTS.md) | Architecture / UX / content / audit experts |

## Snapshot

Cyprus Winter is a winter-positioned Cyprus tourism app. Core loop: **Discover / Search / Trails / Events → Plan → Book**.

- **App:** Next.js 16 App Router, React 19, Tailwind v4, next-intl (en, el, de, pl, ro, fr, he; `he` is RTL)
- **Data:** curated TypeScript in `src/data/`
- **APIs:** `src/app/api/*` with Zod; optional Supabase, Resend, Upstash
- **Dev:** `npm run dev` → http://localhost:3000

## Commands

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

Rebased from PR #11. The original March 2026 UX sprint in that PR is already superseded by later `main` work; do not re-apply it.

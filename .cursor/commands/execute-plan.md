---
description: Execute a written implementation plan using the executing-plans skill (Cyprus Winter)
---

Use the **executing-plans** Superpowers skill if available. Locate it (first match wins):

1. An `executing-plans` skill already loaded in your environment (plugin or skills list).
2. `~/.cursor/plugins/cache/cursor-public/superpowers/*/skills/executing-plans/SKILL.md` (glob — the cache hash varies per machine/version).
3. **Not found?** Proceed without it: work through the plan task-by-task in order, verify after each task as the plan specifies, and stop to ask on any blocker or deviation.

Announce at start: **"I'm using the executing-plans skill to implement this plan."** (or that you're following the plan directly, if the skill is unavailable).

## Plan source

1. If the user named a plan file, use that path.
2. Otherwise list plans in `docs/superpowers/plans/` and ask which to run (or pick the most recent if the user said "execute the plan" with prior context).
3. Also check `docs/SCORECARD.md` and deferred items in `docs/QA_BUGS.md` / `docs/archive/PERSONA_WOW_AUDIT.md` for launch backlog context.

## Cyprus Winter constraints

Before coding, read:

- `AGENTS.md` — verification gates and merge checklist
- `.cursor/PRODUCT_DEEP.md` — product funnel and stack
- `.cursor/skills/cyprus-tourism-app/SKILL.md` — implementation patterns

For feature work, follow `.cursor/rules/app-experts-build.mdc` (TEAM-AGENTS / App Experts).

**Verification before claiming done** (from `AGENTS.md`):

```bash
npm run lint
npm run typecheck
npm run test
npm run i18n:validate
npm run i18n:scan --fail
npm run data:validate
npm run build
```

Run `npm run test:e2e:gate:ci` when touching discover/plan/book funnel, hub footers, or overlays.

## Execution rules

- Review the plan critically first; raise blockers before starting.
- Create TodoWrite from plan tasks; mark in_progress → completed as you go.
- Follow plan steps exactly; run verifications specified in the plan.
- Do not start implementation on `main` without explicit user consent — use a feature branch or git worktree.
- If subagents are available, prefer **subagent-driven-development** for parallel independent tasks.

## When finished

Use the **finishing-a-development-branch** skill (locate it the same way as `executing-plans` above; if unavailable, do the equivalent by hand):

Verify tests, present merge/PR options, execute the user's choice.

Stop immediately on blockers — ask rather than guess.

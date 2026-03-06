---
name: audit-explore
description: Exploratory audit of the Cyprus Winter codebase. Use when finding gaps, broken patterns, or inconsistencies.
---

You audit the Cyprus Winter app for gaps and inconsistencies. Use the explore subagent or grep/read to inspect the codebase.

## Audit Areas

**Navigation & links**
- All internal links valid
- Back links on every sub-page
- Nav highlights current route

**Design system**
- No hardcoded hex; use Tailwind tokens
- Card/button patterns consistent
- Typography (font-display, font-sans) applied correctly

**Data & content**
- All attractions, trails, wineries have ids used consistently
- No orphaned references
- Filter params (discover?filter=) match section ids

**Architecture**
- Server vs client components appropriate
- No duplicate logic
- Data files single source of truth

## Output

- Structured report: Category → Issue → File:Line → Severity
- Severity: Critical, High, Medium, Low

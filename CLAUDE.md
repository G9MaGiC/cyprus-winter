# CLAUDE.md — Cyprus Winter Codebase Guide

This file provides AI assistants with everything needed to understand, navigate, and contribute to the Cyprus Winter codebase effectively.

---

## Project Overview

**Cyprus Winter** is a full-stack travel guide web application for Cyprus, targeting tourists in the winter season. Core user journey: **arrival → discover → plan → book**.

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL with RLS)
- **Deployment:** Vercel
- **Mobile:** Capacitor (iOS/Android wrapper)

---

## Repository Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── [locale]/           # i18n-aware routes (en, de, el, pl)
│   │   ├── (padded)/           # Non-i18n layout group
│   │   └── api/                # API route handlers
│   ├── components/             # React components
│   ├── contexts/               # React Context providers
│   ├── data/                   # Static TypeScript data files
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # next-intl configuration
│   ├── lib/                    # Utility functions and shared logic
│   ├── test/                   # Vitest setup
│   └── types/                  # TypeScript type definitions
├── supabase/                   # DB migrations and config
├── messages/                   # i18n JSON files (en, de, el, pl)
├── e2e/                        # Playwright E2E tests
├── docs/                       # Internal documentation (~80 files)
├── scripts/                    # Build and utility scripts
├── public/                     # Static assets, service worker
├── android/                    # Capacitor Android config
└── .github/workflows/          # CI/CD (ci.yml)
```

---

## Key Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Home / landing |
| `/discover` | Browse attractions with filters |
| `/discover/[id]` | Attraction detail page |
| `/trails` | Hiking trails with difficulty/region filters |
| `/trails/[id]` | Trail detail with map and crowd reports |
| `/plan` | Day-by-day itinerary builder |
| `/events` | Winter events calendar |
| `/airport` | Airport arrival info |
| `/weather` & `/weather/[month]` | Weather forecasts |
| `/regions/[slug]` | Regional guides |
| `/search` | Full-text search |
| `/bookings` | User booking history |
| `/book/winery/[id]` | Winery booking form |

## Key API Routes

| Route | Purpose |
|---|---|
| `POST /api/chat` | AI assistant (multi-provider: OpenAI, Groq, xAI, Ollama) |
| `POST/GET /api/bookings` | Create and retrieve bookings |
| `POST /api/trail-reports` | Crowd-sourced trail condition reports |
| `POST /api/track` | Analytics event tracking |
| `GET /api/stats` | Admin stats (requires `ADMIN_SECRET`) |
| `GET /api/right-now` | Real-time "what's happening now" feed |
| `GET /api/health` | Health check |
| `POST /api/push/subscribe` | Web push subscription |

---

## Development Commands

```bash
# Dev server
npm run dev

# Build
npm run build
npm run start

# Linting & type checks
npm run lint
npm run lint:fix
npm run typecheck

# Unit tests (Vitest)
npm run test
npm run test:watch
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:core-funnel     # Critical flows only (faster)
npm run test:e2e:ci              # CI mode

# i18n
npm run i18n:extract
npm run i18n:validate
npm run i18n:coverage

# Mobile
npm run android:build
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. Required variables:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email via Resend (required for bookings)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Admin
ADMIN_SECRET=

# AI — add at least one provider
OPENAI_API_KEY=
GROQ_API_KEY=
XAI_API_KEY=
MOONSHOT_API_KEY=
OLLAMA_BASE_URL=
OLLAMA_MODEL=

# Rate limiting (optional, falls back to in-memory)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Web push (optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_MAILTO=

# Other
NEXT_PUBLIC_SITE_URL=
CRON_SECRET=
```

Never expose server-side keys (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, all AI keys) to the client. Use the `NEXT_PUBLIC_` prefix only for truly public values.

---

## Architecture & Data Flow

### Static Data First
The bulk of content (attractions, trails, wineries, restaurants, events, regions) lives in **TypeScript files** under `src/data/`. This avoids DB queries for public content and enables fast SSR.

### User Data
1. **Itineraries** — stored in `localStorage` first; URL-shareable via encoded params
2. **Bookings** — submitted via `/api/bookings` → stored in Supabase
3. **Push subscriptions** — stored in Supabase with RLS

### AI Chat
`/api/chat` builds a rich context (from `src/lib/ai-context.ts`) and calls the configured LLM provider. Provider priority: xAI → OpenAI → Groq → Moonshot → Ollama.

### Rate Limiting
All API endpoints use `src/lib/rate-limit.ts`, which uses Redis (Upstash) in production and falls back to in-memory.

---

## Code Conventions

### TypeScript
- **Strict mode** is enabled — no implicit `any`, no unhandled `null`
- Path alias `@/*` maps to `src/*`
- Zod schemas for all external input (API payloads, forms)

### React / Next.js
- **Server Components by default.** Only add `"use client"` when hooks, event listeners, or browser APIs are needed.
- Async Server Components are preferred for data fetching (SSR)
- Client-side interactivity lives in hooks (`src/hooks/`) or lean client wrappers

### Naming
| Thing | Convention |
|---|---|
| Components | `PascalCase.tsx` |
| Hooks | `useCamelCase.ts` |
| Utilities / lib | `kebab-case.ts` |
| Types | `PascalCase` |
| Constants | `UPPER_SNAKE_CASE` |
| Static data files | `kebab-case.ts` |

### File Placement
- Put new utility functions in `src/lib/`
- Put new hooks in `src/hooks/`
- Put new reusable components in `src/components/`
- Put new page-specific components alongside the page or in a feature subfolder

### API Routes
- Use `jsonError()` from `src/lib/api-response.ts` for consistent error responses
- Validate all input with Zod before processing
- Apply rate limiting at the top of the handler
- Sanitize any user-supplied text with `sanitizeText()` before storage

### Security
- Always sanitize user input (`src/lib/sanitize.ts`)
- Validate URLs with `isSafeInternalPath()` (`src/lib/safe-url.ts`)
- Never trust client-supplied IDs without server-side verification
- RLS is enabled on all Supabase tables containing user data

---

## Internationalization (i18n)

- **4 locales:** `en` (default), `de`, `el`, `pl`
- Translation files: `messages/{locale}.json`
- Uses **next-intl** — locale routing via `[locale]` segment
- Server: `const t = await getTranslations('namespace')`
- Client: wrapped in `NextIntlClientProvider`, use `useTranslations('namespace')`
- Run `npm run i18n:validate` before PRs to catch missing keys

---

## Testing

### Unit Tests (Vitest)
- Files: `*.test.ts` / `*.test.tsx` co-located with source
- Environment: Node
- Coverage thresholds: **60% lines/functions/statements, 50% branches**
- Focus on: utilities, schemas, data transformations, API route logic

### E2E Tests (Playwright)
- Files: `e2e/*.spec.ts`
- Browser: Chromium only
- **Core funnel** tests cover the critical `arrival → discover → plan → book` journey
- Run `npm run test:e2e:core-funnel` for fast feedback on the critical path

### What to Test
- Add unit tests for any new utility function or schema
- Add/extend E2E tests for new user-facing flows
- The CI core-funnel gate must always pass before merging

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

| Job | What it checks |
|---|---|
| `core-funnel-gate` | Critical E2E flows (20 min timeout) |
| `quality` | i18n, TypeScript, ESLint, Vitest |
| `build` | `npm run build` succeeds |
| `e2e-full` | Full Playwright suite (35 min timeout) |
| `ci` | Gates on all above jobs |

All jobs must pass. Concurrency is configured to cancel stale runs on the same branch.

---

## State Management

| Data | Storage |
|---|---|
| Itinerary (days/places) | `localStorage` + URL params for sharing |
| User preferences | `localStorage` |
| Recently viewed | `localStorage` |
| Bookings | Supabase (`bookings` table) |
| Auth state | `AuthContext` (placeholder — not fully integrated) |
| Onboarding | `OnboardingContext` + `localStorage` |
| Sticky plan bar visibility | `StickyPlanBarContext` |
| Server/async state | `@tanstack/react-query` (minimal use) |

---

## Key Libraries Reference

| Library | Version | Purpose |
|---|---|---|
| `next` | 16.x | Framework |
| `react` | 19.x | UI |
| `tailwindcss` | 4.x | Styling |
| `@supabase/supabase-js` | 2.x | Database/Auth |
| `next-intl` | 4.x | i18n |
| `zod` | 4.x | Validation |
| `openai` | 6.x | AI (multi-provider SDK) |
| `react-leaflet` | 5.x | Maps |
| `@tanstack/react-query` | 5.x | Async state |
| `resend` | 6.x | Email |
| `@upstash/ratelimit` | 2.x | Rate limiting |
| `@sentry/nextjs` | 10.x | Error tracking |
| `vitest` | 4.x | Unit testing |
| `@playwright/test` | 1.x | E2E testing |
| `@capacitor/core` | 7.x | Mobile wrapper |

---

## Common Patterns & Gotchas

### Adding a New Page
1. Create `src/app/[locale]/your-route/page.tsx` (Server Component)
2. Export `generateMetadata()` for SEO
3. Add translations to all 4 `messages/*.json` files
4. Add nav links via locale-aware `<Link>` from `src/i18n/navigation.ts`

### Adding a New API Endpoint
1. Create `src/app/api/your-route/route.ts`
2. Import and apply rate limiting at the top
3. Parse and validate input with Zod
4. Sanitize any stored text
5. Return errors with `jsonError()` from `src/lib/api-response.ts`
6. Add unit tests for the handler logic

### Modifying Static Data
- Edit the relevant file in `src/data/` (e.g., `attractions.ts`)
- Types are defined inline or in `src/types/`
- No DB migration needed — it's just TypeScript

### Working with Supabase
- Server-side: use `createClient()` from `src/lib/supabase.ts`
- Client-side: use `createBrowserClient()` from `src/lib/supabase-browser.ts`
- Never use the service role key in client components
- Check `supabase/` for migration files when modifying schema

### AI Chat Context
`src/lib/ai-context.ts` builds the system prompt dynamically using static data. Update this file when adding new data sources that the AI assistant should know about.

### Design Tokens
Colors, typography, and spacing constants are in `src/lib/design-tokens.ts`. Use these instead of hardcoding values to stay consistent with the design system.

---

## Docs

The `docs/` directory contains ~80 internal markdown files covering:
- Architecture and system design
- QA and testing reports
- SEO and i18n audits
- UI/UX reviews
- Deployment checklists
- API stress test results

Refer to `TECHNICAL.md` (root) for a concise architecture overview, and `PRD.md` for product requirements.

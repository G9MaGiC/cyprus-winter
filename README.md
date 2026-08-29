# Cyprus Winter

A tourism app for Cyprus that meets visitors at the airport and keeps them engaged throughout their stay. Beautiful, useful, and habit-forming by design.

**Context for contributors and agents:** a dense product and stack kernel (funnel, personas, trust, technical map) lives in [`.cursor/PRODUCT_DEEP.md`](.cursor/PRODUCT_DEEP.md).

---

## Product Idea (In Detail)

### Vision

*Make Cyprus travel planning effortless and inspiring—from touchdown to sunset.*

Cyprus Winter is **winter-differentiated** (Nov–Mar positioning in the product spec): mild days, Troodos trails, villages and wine—always grounded in curated data, not generic summer-beach noise. See [`.cursor/PRODUCT_DEEP.md`](.cursor/PRODUCT_DEEP.md) for the full funnel and stack picture.

Cyprus Winter (Cyprus) is a **seasonal, destination-focused travel guide** that:
- Catches travellers at their highest-intent moment: **arrival**
- Surfaces curated places (beaches, ancient sites, villages, monasteries) instead of overwhelming them
- Lets users **build a personal itinerary** so the app becomes their daily companion
- Builds trust through **expert curation** and a visible team

Unlike generic travel sites (TripAdvisor, Booking), we focus on **one island, one experience**—so every screen is relevant. We differentiate by being the **single source of truth** for Cyprus, from airport logistics to the best beach for families.

### Target User

- **Primary:** Sun-seeking winter travellers planning a break in Cyprus
- **Secondary:** First-time visitors wanting a simple, trusted guide
- **Context:** Often on mobile at the airport, by the pool, or planning the next day’s outing

### Positioning Statement

> For travellers planning a Cyprus trip who want a clear, trustworthy guide from arrival to departure, Cyprus Winter is a destination app that curates the best places and helps them build a personal itinerary. Unlike generic travel sites, we focus only on Cyprus and guide users from the moment they land.

---

## Features (Current & Roadmap)

### Current Features

| Feature | Description | Pages |
|---------|-------------|-------|
| **Arriving** | LCA (Larnaca) & PFO (Paphos) airport info: taxi, bus, car rental with costs and tips; quick tips (WiFi, SIM, currency, emergency numbers) | `/airport` |
| **Discover** | Curated attractions by type (Beaches, Ancient sites, Villages, Wineries, Monasteries); filter chips; related places | `/discover`, `/discover/[id]` |
| **Trails** | Trail conditions with difficulty/region filters; crowd-sourced reports; combine-with suggestions | `/trails`, `/trails/[id]`, `/trails/[id]/report` |
| **Events** | Winter events (Epiphany, carnival, Commandaria, markets) by month | `/events` |
| **Plan** | Day-by-day itinerary builder; winter templates; shareable links; wineries, trails, attractions | `/plan` |
| **Team** | Expert profiles (CEO, CTO, CPO, Tourism, Growth, Design) with expertise and bios | `/team` |
| **AI Assistant** | Chat with an AI guide about trails, wineries, villages; type or use voice; get itinerary suggestions | Global (chat bubble) |
| **Bookings** | In-app winery tasting booking; request form; My Bookings page | `/book/winery/[id]`, `/bookings` |
| **Account** | Supabase auth (email/password, magic link); settings; optional sync for bookings | `/account`, `/login`, `/register` |
| **PWA** | Locale-aware web manifest; install prompt; offline plan queue | `/install`, `/manifests/[locale]` |

### Data Models

- **Attraction:** id, name, region, description, type, highlights, bestFor (+ optional winterTip, combineWith, etc.)
- **Airport:** code, name, city, transport options, tips
- **TeamMember:** id, name, role, expertise, bio, linkedIn

### Potential Roadmap (Future)

- **Seasonal content:** Winter-specific events, weather, quieter spots
- **Save favourites** (persisted account-wide beyond localStorage)
- **Map view** for attractions and transport (Discover map tab exists; broader map UX TBD)
- **Recommendations** based on preferences (family, couples, culture, etc.)

---

## UX/UI & Engagement Tactics

This section outlines design patterns that increase **stickiness, return visits, and completion** in an ethical way—making the app genuinely useful while encouraging repeated use.

---

### 1. Hook Model (Trigger → Action → Variable Reward → Investment)

| Phase | Implementation | Rationale |
|-------|----------------|-----------|
| **External Trigger** | "Just arrived? Start here" CTA on hero; "Save this app for offline use" | High-intent moment: user landed and needs help. Urgency to save for later. |
| **Action** | Low-friction CTAs (rounded-full buttons, clear labels); one-tap add/remove in Plan | Easy first steps; no sign-up gate for core flows. |
| **Variable Reward** | Different attraction types and highlights; "hidden gems" language; tips that feel like local knowledge | Curiosity and discovery feel rewarding; not predictable. |
| **Investment** | Itinerary builder: user invests time building their plan; data feels "mine" | Sunk effort increases likelihood of returning. |

**Recommendations:**
- Add a **daily tip** or **"Place of the day"** for variable reward.
- Persist itinerary in localStorage so the user’s investment survives reloads.
- Use **push/reminder** (e.g. PWA): "Your Day 2 plan is ready" when trip approaches.

---

### 2. Progress & Completion

| Tactic | Current State | Enhancement |
|--------|---------------|-------------|
| **Progress bars** | Not used | Add "Your trip: 2/3 days planned" or "3 places added" to Plan. |
| **Empty states** | "Add places from the list →" | Friendly prompts: "Start with a beach—Nissi is a crowd favourite." |
| **Completion cues** | "✓ Added" on cards | Celebrate: "Day 1 is full! Great mix of culture and beach." |
| **Checklists** | Airport tips as bullets | "Before you go" checklist with tickable items. |

**Psychology:** Visible progress increases motivation (Zeigarnik effect). Completing small steps (e.g. "Plan Day 1") feels good and encourages planning the rest.

---

### 3. Variable Rewards (FOMO & Curiosity)

| Tactic | Implementation |
|--------|----------------|
| **Limited spots** | "Top 4 beaches," "UN Best Tourism Village 2024" — scarcity and prestige. |
| **Local secrets** | Tips like "Pre-book taxi for best rates," "Check Lara for turtles" feel exclusive. |
| **"Best for" tags** | Users self-identify ("Families," "Couples") and feel understood. |
| **Scroll-to-reveal** | Sections (beaches, ancient, villages) reveal more as user scrolls; sense of discovery. |

**Recommendations:**
- Add "Local tip" badges on attraction cards.
- "3 more places like this" at bottom of detail pages.
- "Most added to itineraries" or "Popular this week" labels.

---

### 4. Social Proof & Authority

| Tactic | Implementation |
|--------|----------------|
| **Expert team** | Team page with CPO, Tourism Officer, Growth—builds trust. |
| **UNESCO / awards** | "UNESCO World Heritage," "Top 25 beach in Europe" on cards. |
| **Best-for tags** | "Families," "History buffs" signal peer validation. |

**Recommendations:**
- "Recommended by our Cyprus expert" on key attractions.
- Simple social proof: "X travellers added this to their plan" (if tracking is available).

---

### 5. Habit Stacking & Contextual Cues

| Tactic | Implementation |
|--------|----------------|
| **Contextual links** | "Just arrived? Start here" → airport; "Start exploring →" after airport; "Add to my itinerary →" on attraction detail. |
| **Clear next step** | Every page suggests the next logical action. |
| **Trip phases** | Arrive → Discover → Plan → (future: Book, Remember). |

**Recommendation:** Add a lightweight onboarding: "Where are you staying? Larnaca / Paphos / Limassol / Other" to tailor suggestions and transport.

---

### 6. Visual & Haptic Feedback

| Tactic | Current | Enhancement |
|--------|---------|-------------|
| **Add to plan** | Card changes to terracotta border + "✓ Added" | Add a subtle animation (e.g. checkmark bounce) or haptic on add. |
| **Navigation** | Active nav link highlighted in terracotta | Keep; consider subtle underline or pill. |
| **Hover states** | Cards lift, borders change | Maintain; add micro-interactions on primary CTAs. |
| **Loading** | Default Next.js behaviour | Skeleton screens for Discover/Plan for perceived speed. |

---

### 7. Scarcity & Urgency (Ethical)

| Tactic | Use |
|--------|-----|
| **Seasonal framing** | "Winter in Cyprus" — implies limited timeframe. |
| **"Best time to visit"** | E.g. "Turtles at Lara: May–August" — encourages planning. |
| **Offline save** | "Save for your trip" — prompts action before landing. |

**Avoid:** Fake countdowns, fake "X people viewing," or pressure to book immediately. Keep scarcity tied to real constraints (seasons, events).

---

### 8. Personalization & Ownership

| Tactic | Implementation |
|--------|----------------|
| **"My itinerary"** | User builds their own plan; sense of ownership. |
| **Day tabs** | "Day 1," "Day 2," "Day 3" — clear mental model. |
| **Remove button** | User controls the plan; low commitment. |

**Recommendations:**
- Optional name: "Maria's Cyprus Trip."
- Export itinerary as PDF or shareable link for social sharing and memory.

---

### 9. Reduces Friction

| Tactic | Implementation |
|--------|----------------|
| **No sign-up for core flows** | Discover and Plan work without account. |
| **One-tap add** | Add/remove from plan with single click. |
| **Fast navigation** | Fixed nav, clear back links, deep links to sections. |
| **Mobile-first** | Touch targets, collapsible nav, readable typography. |

---

### 10. Micro-copy & Tone

| Principle | Example |
|-----------|---------|
| **Action-oriented** | "Just arrived? Start here" vs "Airport information." |
| **Friendly, not salesy** | "Add to my itinerary" vs "Book now." |
| **Local flavour** | Use place names (Nissi, Kourion, Lefkara) to feel authentic. |
| **Reassurance** | "Emergency: 112 · Tourist info: 1460" at bottom. |

---

## Design System Summary (2026)

- **Colours:** Earth-inspired palette — Terracotta (CTAs), Aegean, Sage (accents), Cloud/Sand (base)
- **Typography:** Fraunces (headings), Plus Jakarta Sans (body) — contrast-through-history pairing
- **Patterns:** Rounded-xl cards, subtle shadows, reduced cognitive load, Mediterranean warmth
- **Responsive:** Mobile-first, 375px+ tested

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Data:** Static TypeScript in `src/data/` for attractions, trails, wineries, etc.
- **Backend:** Supabase (bookings, trail reports, conversion tracking); API routes at `/api/bookings`, `/api/trail-reports`, `/api/chat`, `/api/track`, etc. Deploy to Vercel or any Node host—API routes require a server.
- **AI:** Groq (Llama), Ollama, Moonshot, or OpenAI (chat); Web Speech API (voice in/out)

---

## AI Assistant Setup

The app includes an AI-powered chat assistant with voice input/output. To enable it:

1. Copy `.env.example` to `.env.local` and fill in required vars
2. Add **one** of:
   - `XAI_API_KEY=...` ([xAI Grok](https://console.x.ai), model: grok-3-mini)
   - `GROQ_API_KEY=...` ([Groq](https://console.groq.com) — free tier, Llama models)
   - `OLLAMA_BASE_URL=http://localhost:11434/v1` (local [Ollama](https://ollama.com); optional `OLLAMA_MODEL=llama3.2`, `OLLAMA_TIMEOUT_MS=60000`; recommended models: llama3.2, llama3.1, qwen2.5:7b, mistral — run `ollama pull <model>` before setting OLLAMA_MODEL; in development, Ollama is tried first when configured)
   - `MOONSHOT_API_KEY=sk-...` ([Moonshot](https://platform.moonshot.ai/console/api-keys))
   - `OPENAI_API_KEY=sk-...` ([OpenAI](https://platform.openai.com/api-keys), uses gpt-4o-mini)
3. Restart the dev server

 Voice uses the browser’s Web Speech API (Chrome/Edge/Safari).

---

**Admin stats** (`/admin/stats`): Set `ADMIN_SECRET` in your environment. The page prompts for it and exchanges it for an HttpOnly session cookie (`POST /api/admin/session`). Stats requests then use that cookie. Scripts can still send `Authorization: Bearer`. Without a valid session or Bearer token, the stats API returns 401.

**Server-only env vars (do not prefix with `NEXT_PUBLIC_`):** `XAI_API_KEY`, `GROQ_API_KEY`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_TIMEOUT_MS`, `MOONSHOT_API_KEY`, or `OPENAI_API_KEY` (for AI chat); `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`, `HEALTH_SECRET`. These are used only in API routes or server code and must not be exposed to the client bundle.

**Redis (production rate limiting):** Upstash Redis is required in production; the app fails closed if distributed rate limiting is not configured. Configure it before deploying:

1. Create a database at [console.upstash.com](https://console.upstash.com)
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your environment
3. Deploy

Full setup: [docs/REDIS_SETUP.md](docs/REDIS_SETUP.md)

## Run

### Get the source

```bash
git clone https://github.com/G9MaGiC/cyprus-winter.git
cd cyprus-winter
```

```bash
npm install
npm run dev
npm run test   # Vitest
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

**Troubleshooting:** If build fails with `EACCES` on `.next`, the output dirs may be root-owned. Fix: `sudo chown -R $(whoami) .next .next-build 2>/dev/null` then `rm -rf .next .next-build` and `npm run build` (or `npm run build:clean` after chown). See [docs/RUNBOOK.md](docs/RUNBOOK.md) for full details.

---

## Summary

Cyprus is built to be **useful first**—airport info, curated places, itinerary building—and **engagement-enhanced** through progress, variable rewards, and low-friction flows. The goal is for users to open it at the airport and keep it open throughout their trip, turning it into their go-to Cyprus companion.

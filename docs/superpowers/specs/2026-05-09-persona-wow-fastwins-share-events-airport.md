---
title: "Persona WOW — fast wins + share recipient view"
date: "2026-05-09"
status: approved
owner: "AI agent"
refs:
  - "docs/archive/PERSONA_WOW_AUDIT.md"
  - ".cursor/UX_PERSONA.md"
  - ".cursor/PRODUCT_DEEP.md"
---

## Goal

Ship the **Option A** slice (effort/impact) that improves perceived quality and conversion across personas:

- **G5 lite**: Airport → `short-stay` plan template feels “ready” in the first viewport.
- **G6 lite**: Events page shows “freshness” / seasonal cues and improved empty states.
- **G1 lite → G1 proper**: Plan share experience becomes premium and recipient-aware, culminating in a share recipient view with dynamic preview metadata.

## Non-goals

- No new data pipeline / CMS for events (beyond “freshness cues” and framing).
- No persistent server-side plan storage (share uses URL payload).
- No OG image generation pipeline in this slice (title/description only; image can remain existing default unless trivial).

## Product / UX principles (Cyprus secret)

From `.cursor/UX_PERSONA.md`:

- Quiet, premium confidence; no loud/FOMO CTAs.
- Discovery-first; one clear primary action per screen.
- Mobile-first, safe-area-aware, 44px touch targets.

## Proposed solution (high level)

### 1) G5 lite — Airport → short-stay template payoff

**User problem:** Bleisure/arrival users click “Plan your first 48 hours” and land in a plan state that may feel incomplete or require too many taps/scrolls to understand the “arc”.

**Design changes:**

- Ensure `/plan?template=short-stay` renders a **top-of-plan “Start here”** section:
  - 1–2 sentence framing (Tonight / Tomorrow / Day 2).
  - A single primary CTA that is visible in the **first viewport** on mobile (no scroll). Preferred options:
    - **“Add the first stop”** (opens add flow / picker)
    - **“Open tonight”** (scrolls/jumps to Tonight block)
- Reduce cognitive load by anchoring the template into 2–3 blocks and ensuring the first block is scannable without scrolling.

**Acceptance criteria:**

- On a ~390×844 viewport (mobile), `/plan?template=short-stay` shows:
  - “Start here” section
  - A primary CTA button fully visible (not behind sticky bars / BottomNav)
  - The first block header (“Tonight” or equivalent) visible within the first ~1.5 screens

**Success signals:** Increased `template=short-stay` landings that lead to a plan interaction (first add / scroll / template open) and increased `first_add_to_plan` within session; qualitatively “feels ready” on first view.

### 2) G6 lite — Events freshness cues

**User problem:** Without signals of recency/curation, events can feel stale even if accurate.

**Design changes:**

- Add “seasonal framing + updated cue” near the top of `/events`:
  - Example copy (to be localized later if needed): **“Winter picks (Nov–Apr). Updated monthly.”**
- Improve empty states:
  - “No events listed yet — check back soon. In the meantime: Secrets / Plan / Ask AI.”
- Add minimal metadata improvements (title/description) consistent with Strategy A (canonical / default locale) without creating new locale SEO surfaces.

**Acceptance criteria:**

- `/events` includes a visible recency cue (seasonal + “updated” language) above the fold.
- Empty state includes at least one gentle recovery CTA that matches the UX persona (quiet confidence; no urgency).

**Success signals:** Higher engagement on events page; improved trust perception; reduced pogo-sticking from events index.

### 3) G1 lite → proper — Plan sharing

#### G1 lite: premium share affordance

**User problem:** Share works but doesn’t feel like a “story-grade object.” Recipients may see a generic preview or unclear value.

**Design changes:**

- Improve share microcopy and defaults (share title / summary text).
- Make recipient expectation explicit: “They’ll see a clean, read-only summary. They can open it in Plan.”
- Ensure share CTA is reachable and not obscured by sticky bars / BottomNav on mobile.

#### G1 proper: recipient view + dynamic metadata

**User problem:** Shared plan links lack a strong preview and recipient-friendly view.

**Approach:** **URL-encoded plan payload** (no DB):

- On share, generate a link to a recipient route: `/share/plan?p=<payload>`
  - Payload contains the minimum plan representation needed for a summary (days + item IDs/types), **no PII**, no freeform user-entered strings.
  - Encoding: **JSON → base64url**.
  - Validation: strict schema; reject unknown types and unknown IDs.
- Payload schema (v1):

```ts
type SharedPlanV1 = {
  v: 1;
  // Optional label used only for display, chosen from a fixed set (no freeform).
  // Example: "short-stay" when coming from /airport.
  template?: "short-stay" | "classic-7" | "none";
  days: Array<{
    // 1-indexed for display
    d: number;
    items: Array<{
      id: string;
      t: "attraction" | "trail" | "winery" | "restaurant";
    }>;
  }>;
};
```

- Size constraints (hard caps):
  - Max **7** days
  - Max **6** items per day
  - Hard-fail if payload is larger than ~3KB decoded (guardrail for URL length)
- Recipient page:
  - Read-only summary card(s): title, 1-line summary, day blocks, “Open in Plan” CTA (which converts payload into the plan editor).
  - Clear trust framing: “Curated winter picks. Save and tweak in Plan.”
- Dynamic metadata:
  - Title and description derived from plan content (e.g. “48 hours: Troodos + wine”).
  - Canonical and alternates follow Strategy A conventions.

**Constraints:**

- URL length: keep payload small; cap number of items/days in share link.
- Security: treat payload as untrusted input (validate schema, restrict allowed IDs/types, never render user-controlled HTML).
- Privacy: never include email/name/notes; never include per-user internal IDs; shared link should be safe to post publicly.

**Success signals:** More share link clicks and higher “open in plan” actions; improved preview quality in messaging apps.

## Testing & verification

- Unit tests for payload encode/decode + validation.
- Playwright:
  - Ensure `/plan?template=short-stay` shows first action in viewport on mobile project.
  - Ensure `/share/plan` loads and shows summary + open-in-plan CTA.
  - Ensure metadata endpoints produce the expected title/description (as feasible in e2e).
- Run baseline gates: `lint`, `typecheck`, `test`, `build`, `test:e2e:core-funnel:ci`.

## Rollout / instrumentation

- Track:
  - share CTA clicks, link copied, “open in plan” actions from recipient view.
  - template landings for short-stay and subsequent plan interactions.


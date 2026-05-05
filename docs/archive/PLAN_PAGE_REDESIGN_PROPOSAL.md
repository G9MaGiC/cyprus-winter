**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Plan Page — Redesign Proposal

**Intent:** Rethink layout, flows, and structure of the itinerary planner. Mobile-first, discovery-led.

---

## Current Flow (Summary)

1. Land on Plan → Hero + stats (when hasContent) + Copy/Share
2. Day tabs (1–5) — sticky on desktop
3. "Start here" → Quick-add chips + templates grid
4. Day panel → Itinerary cards for active day
5. "Pair with…" ( SuggestedForDay )
6. "Browse all places" ( PlacePicker )

**Pain points:** Many steps before adding; day-centric model can feel heavy; adding is buried in collapsibles.

---

## Redesign Directions

### Option A: Action-First Flow

**Idea:** Lead with "Add something" — minimal hero, prominent add surface.

| Section | Current | Redesign |
|---------|---------|----------|
| Hero | Title, description, stats, Copy/Share | Title + one line. Stats move to floating badge or bottom sheet. |
| Primary action | CTA scrolls to templates | Add bar always visible (search or quick picks). Templates become secondary. |
| Day selector | Top, sticky | Inline with first card or bottom sheet. Swipe/tap to change day. |
| Adding | PlacePicker in collapsible | Full-screen modal or sheet: search → tap to add. Closes, shows card. |

**Layout:** Single column. Hero (compact) → Add bar (fixed or prominent) → Day 1 card (if empty, "Add your first stop") → Day 2… or horizontal day strip + single day view.

---

### Option B: Timeline-First

**Idea:** The trip is a vertical timeline; days are expandable rows.

| Section | Current | Redesign |
|---------|---------|----------|
| Hero | Same | Compact. Copy/Share in overflow menu. |
| Days | Horizontal tabs | Vertical accordion or list: "Day 1", "Day 2"… Expand to see cards + add. |
| Adding | In PlacePicker/Browse | Inline "+ Add stop" between cards. Or "+ Add day" at end. |

**Layout:** Scrollable timeline. Each day = expandable block. Add inline per day. Templates = "Fill Day 1" / "Fill all" shortcuts.

---

### Option C: Single-Day Focus

**Idea:** Focus on one day at a time; days are a lightweight switcher.

| Section | Current | Redesign |
|---------|---------|----------|
| Hero | Same | Slim. Day switcher: "Day 2 of 5" with arrows. |
| Content | Day panel + Pair with + Browse | One view: Day content + "Add next" (suggested + browse) in same scroll. |
| Adding | Two collapsibles | Single "Add place" entry: chips + categories in one panel. |

**Layout:** One scroll. Day header → cards → Add section (not collapsible) → footer. Day switcher minimal (chevrons or dropdown).

---

## Recommended: Hybrid (A + C)

1. **Hero:** Title + one line. Copy/Share in menu or floating action.
2. **Day switcher:** Compact pills, not sticky on mobile. "Day 2 · 3 places".
3. **Content:** Day cards in order. After last card: inline "Add next stop" (chips + "Browse all" link).
4. **Adding:** "Browse all" opens full-screen or bottom sheet with search + categories. Add → sheet closes → card appears.

**Benefits:** Add is always one tap away. No nested collapsibles. Timeline remains clear. Mobile-first.

---

## Structure Comparison

| Element | Current | Proposed (Hybrid) |
|---------|---------|-------------------|
| Hero height | Tall (stats, steps, Copy) | Short (title + tagline) |
| Day selector | Tabs + optional details | Compact pills, inline |
| Empty state | "Add your first place" in card | "Add your first stop" + chips inline |
| PlacePicker | Inside details "Browse all" | Full-screen/sheet from "Browse all" |
| Templates | Grid/carousel in Start here | Modal or inline "Start with a template" link |
| Copy/Share | In hero | Overflow menu or floating |

---

## Implementation Scope

- **Low effort:** Move Copy/Share to overflow; slim hero; inline add chips.
- **Medium:** Full-screen PlacePicker; compact day switcher.
- **High:** New layout components (bottom sheet, full-screen add); flow changes.

---

## Next Step

Choose direction (A, B, C, or Hybrid) and effort level. Then we can break it into implementation tasks.

---

## Implementation Complete (Hybrid A+C)

- Slim hero: stats line + Copy/Share dropdown ✓
- Compact day pills: "Day N · X" ✓
- Inline Add next stop: chips + Browse all → PlacePickerModal ✓
- Pair with suggestions: SuggestedForDay embedded in inline add (when has places) ✓
- PlanStickyAddBar: opens Browse modal on tap ✓
- PlacePickerModal: backdrop click to close ✓

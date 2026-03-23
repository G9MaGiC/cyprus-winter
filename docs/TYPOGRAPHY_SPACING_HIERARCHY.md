# Typography, Spacing & Hierarchy

Reference for Cyprus Winter design tokens. Use these consistently; avoid ad-hoc classes.

## Typography

### Fonts
- **Display (headings):** Fraunces — `font-display`
- **Body:** Plus Jakarta Sans — default sans

### TYPE tokens (design-tokens.ts)
| Token | Use case | Classes |
|-------|----------|---------|
| `TYPE.pageTitle` | Page h1 (PageHeader, ListPageHero) | font-display text-3xl sm:text-4xl font-bold text-olive leading-tight |
| `TYPE.sectionTitle` | Section h2 (Explore, This week, list intros) | font-display text-2xl sm:text-3xl font-semibold text-charcoal leading-tight |
| `TYPE.sectionSubtitle` | Section subtitles | text-sage text-sm sm:text-base leading-relaxed |
| `TYPE.cardTitle` | Card h3 titles | font-display text-lg font-semibold text-olive |
| `TYPE.subSectionTitle` | Sub-section h2 (weather conditions, plan map, day panel) | font-display text-xl font-semibold leading-tight |
| `TYPE.subSectionTitleLg` | Sub-section with responsive bump | font-display text-xl sm:text-2xl font-semibold leading-tight |
| `TYPE.kicker` | Labels above content (on light) | prose-label text-sage |
| `TYPE.kickerOnDark` | Labels on dark overlays | prose-label text-white/80 |

### Prose utilities (globals.css)
| Class | Use case | Spec |
|-------|----------|------|
| `prose-intro` | Hero/lead paragraphs | 1.125rem, line-height 1.7 |
| `prose-body` | Body text | line-height 1.7 |
| `prose-label` | Uppercase labels, kickers | 0.8125rem, 600, uppercase, 0.1em tracking |
| `prose-quote` | Block quotes | line-height 1.65, letter-spacing 0.01em |

### Text hierarchy (color)
| Purpose | Class |
|---------|-------|
| Primary body | `text-olive` |
| Secondary/muted | `text-olive/80` |
| Tertiary/captions | `text-olive/70`, `text-olive/60` |
| Accent (links, labels) | `text-aegean`, `text-terracotta`, `text-sage` |

---

## Spacing

### LAYOUT
| Token | Use case |
|-------|----------|
| `LAYOUT.safeAreaX` | Horizontal padding (notch-safe) |
| `LAYOUT.list` | List pages max-width (max-w-5xl) |
| `LAYOUT.detail` | Detail pages (max-w-3xl) |
| `LAYOUT.pagePy` | List/form vertical padding (py-8 sm:py-12) |
| `LAYOUT.pagePyDetail` | Detail page vertical padding |
| `LAYOUT.pagePyPlan` | Plan page (hero-first + nav clearance) |

### SECTION
| Token | Use case |
|-------|----------|
| `SECTION.headingMargin` | After page header/hero (mb-8 sm:mb-10) |
| `SECTION.headingGap` | Between heading and content block (mb-4 sm:mb-6) |
| `SECTION.titleGap` | Between heading and subtitle (mb-2) |
| `SECTION.blockGap` | Between major sections (space-y-12 sm:space-y-16) |
| `SECTION.blockTop` | Top margin for sections within a page (mt-10 sm:mt-12) |
| `SECTION.py` | Major hub section padding |
| `SECTION.pySub` | Subsection padding |

### CARD
| Token | Use case |
|-------|----------|
| `CARD.content` | Card body padding (p-5 sm:p-6) |
| `CARD.contentLg` | Content-heavy sections (p-6 sm:p-8) |

### Gap scale
Prefer Tailwind: `gap-2` (8px) tight inline, `gap-3` (12px) buttons/chips, `gap-4` (16px) sections, `gap-6` (24px) major blocks.

---

## Hierarchy

### CTA
| Token | Use case |
|-------|----------|
| `CTA.primary`, `CTA.primaryCompact` | Main actions (Explore, Plan, Book) |
| `CTA.secondaryCompact` | Secondary on light (terracotta border) |
| `CTA.chipPrimary`, `CTA.chipSecondary`, `CTA.chipTertiary` | Chips, pills |
| `SECTION.aegeanLink` | Contextual/secondary links |

### Semantic colors
- **Primary CTA:** terracotta
- **Secondary/contextual:** aegean
- **Accent on dark:** golden
- **Labels, trails:** sage

---

## Checklist for new components
- [ ] Headings use TYPE tokens or font-display + scale
- [ ] Labels/kickers use prose-label or TYPE.kicker (with color override)
- [ ] Body/captions use prose-intro, prose-body, or text-olive/80
- [ ] Spacing uses SECTION or LAYOUT tokens where applicable
- [ ] CTAs use CTA tokens; links use SECTION.aegeanLink when secondary

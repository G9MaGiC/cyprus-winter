# Changelog

All notable changes to Cyprus Winter are documented here.

## [2.0.0] - March 2026

### Phase 1 completion

Release marking pre-launch polish and Phase 1 MVP completion per [ROADMAP.md](ROADMAP.md).

### Summary

- **Version bump:** 0.1.0 → 2.0.0
- **Homepage conversion polish:** Eyebrow ("The Mediterranean's best-kept secret"), ghost CTA ("Just arrived?"), sticky Plan CTA, Add to plan on Editor's picks and This week cards, section rhythm (Explore → This week → Editor's picks → Book tastings → Plan/Events → Why Cyprus)
- **Design tokens:** CTA objects in `design-tokens.ts`, hero overlay simplified (`from-charcoal via-charcoal/50 to-charcoal/5`), LAYOUT, SECTION, CARD, HERO
- **Rate limiting:** Weather API (30/min), VAPID API (10/min) — both routes protected
- **Data fix:** Orphan combineWith ID `pissouri` corrected to `pissouri-tavernas` in trails data

### References

- [docs/HOMEPAGE_REVIEW_RECOMMENDATIONS.md](HOMEPAGE_REVIEW_RECOMMENDATIONS.md)
- [docs/QA_BUGS.md](QA_BUGS.md)
- [docs/QA_PLAN.md](QA_PLAN.md)

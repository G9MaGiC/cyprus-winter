# Owner decisions — everything that still needs a signature, not a keyboard

*Companion to `docs/UX_UI_PERSONA_AUDIT_2026-08-31.md` (batch 75). As of batches 56–80, every code-shaped item in the audit register is shipped, reviewed (two adversarial code passes, a claims audit, three full e2e battery runs, a security sweep) and locally verified; server-side CI gating remains unavailable under D0. What remains is listed here as one answerable decision each — with a recommendation, and with what ships the moment it's decided. Ordered by how much each decision unblocks.*

## D0 — Restore GitHub Actions (discovered during PR #236; blocks all CI value)

**Blocked today:** every Actions run in the repository has ended in `startup_failure` since at least August 31 — on main and every branch, including the five previously merged audit PRs. Jobs never start; runs land on a nameless "BuildFailed" pseudo-workflow. The workflow file is valid, so this is account-level: typically a reached Actions spending limit or a failed payment method (GitHub → Settings → Billing and plans), or Actions disabled under the repository's Settings → Actions.

**The decision:** check those two settings pages and restore Actions.

**Until then:** the only real verification is the local pre-push battery every commit on this branch went through (three full 117-test suite runs included). Once restored, re-run the workflow on the latest commit to get the first server-side green since August.

## D1 — Provision the real mailbox (AUD-67; unblocks AUD-81 residual)

**Blocked today:** `cypruswinter.com` has no MX record, so the legal/GDPR contact addresses in privacy/terms advertise unreachable mailboxes, and `/partner/join` deliberately publishes **no** onboarding contact (the no-dead-channels rule, batch 48) — B2B partners have no direct way in.

**The decision:** which real, monitored address(es) to stand up — e.g. `legal@` and `partners@` on `cypruswinter.com` (recommended: set up mail hosting/MX for the domain the pages already name), or an existing external address as an interim, or a Resend-backed contact form instead of a public address.

**Ships when decided (≈1 batch):** privacy/terms contact swap ×7 locales; the `/partner/join` direct channel goes live; AUD-67 and the AUD-81 residual close.

## D2 — Commission the legal review (AUD-72 + the sign-off that gates D3)

**Blocked today:** privacy/terms carry a hardcoded "Last updated: March 2026" (stale), and the lawyer sign-off is the standing blocker for beta-locale graduation.

**The decision:** engage the lawyer to review privacy/terms (content is fully translated ×7 — the beta-readiness report shows privacy/terms at zero EN-identical strings in all three beta locales).

**Ships when decided:** refreshed "last updated" dates ×7 (trivial once the review lands); the sign-off unlocks D3.

## D3 — Graduate the beta locales (fr/he/ro)

**Blocked today:** `Graduation: BLOCKED until lawyer sign-off + empty BETA_LOCALES` (`npm run i18n:beta-readiness`; process in `docs/BETA_LOCALE_GRADUATION.md`). Substantively the locales are ready: privacy/terms 0 EN-identical; what remains EN-identical is admin surface (25 rows), intentional holdouts and cognates, plus small "REVIEW NEEDED" tails (fr 19, he 5, ro 18) that D4's reviewers will settle.

**The decision:** after D2's sign-off, say the word — clearing `BETA_LOCALES` is a one-line change.

**Ships when decided:** the beta labels drop; fr/he/ro become full locales.

## D4 — Kick off the native ◇ review

**Blocked today:** every translation shipped on this branch is ◇ (machine-drafted, pending native review) per the ICPS §6.1 standard. The handoff package has been ready since batch 33 and the sheets are kept current by a CI freshness gate: `docs/i18n-review/` — one CSV per locale, with the reviewer instructions in its README.

**The decision:** name one native reviewer per locale (de, el, pl, ro, fr, he) and send them the sheets.

**Ships when decided:** corrections land through the normal catalog pipeline (the drift gates catch desync automatically); ◇ marks clear per locale as sign-offs arrive. This also resolves D3's small "REVIEW NEEDED" tails.

## D5 — Wiz "50 Best" duplicate rank — **RESOLVED (batch 76, fact-checked)**

The list was checked against press coverage of the WiZ 50 Best Restaurants 2025 (announced 27 January 2026, Hilton Nicosia; the guide's own site is unreachable from this build environment, so coverage was used): **The Polo #1** for the second consecutive year (matches our data), **COR gastronomy #2** (our claim was correct — kept), **Seasons Oriental 4th** (our "#2 for 2025" and "top 3" were the errors). Correction shipped ×7 locales using the house "top 5" phrasing (the wording already used for 4th–5th places). If you want the exact "#4" instead of "top 5", it's a one-line refinement — verify against cyprus.wiz-guide.com first.

## D6 — Curate the family lane (AUD-58) — **RESOLVED (batch 80, approved)**

The batch-76 proposal shipped, with one diagnosis upgrade found during implementation: three of the four "family wineries" were a **predicate artifact** — the filter substring-matched `"famil"`, so the *ownership* tokens "Family heritage" / "Family-run" / "Family-run feel" had been putting tasting rooms in the children's lane; only sterna-boutique carried the real audience tag. What shipped: the predicate now matches audience tokens exactly (ownership chips stay truthful on winery pages and in search); `lefkara`, `omodos` and `kalopanagiotis` (the Christmas Village host — the village carries the December intent since events aren't lane-reachable) joined via the `"Families"` tag; sterna-boutique's tag removed per the proposal; the lane leads with the flamingos and the UNESCO round huts; and the easy short trails (Kavos 1.2 km, Livadi 1.5 km, Dwarf Oaks 2 km) render as chips through the section's existing trail-links slot. All 7 locales automatic; three new unit tests pin membership, order and chips. The one recorded limit — the family map view not plotting the trail markers — closed in batch 81 (the filtered map view now plots a section's trails).

## D7 — Per-guide price quotes (AUD-23 residual) — *supply*

The honest association-range signal shipped (batch 47). Individual quotes need numbers from the guides themselves. Nothing to build until partners supply them.

## D8 — Advisory alert-time behavior (AUD-25 residual) — *needs a source*

The per-locale advisory link map shipped (batch 43); the `/book/*` strip question was closed by design (batch 50). What remains is what the strip should do **during** an active alert — which needs a machine-readable alert source. **Candidates (researched batch 76):** (1) **MeteoAlarm Atom feeds** (`feeds.meteoalarm.org`) — the pan-European CAP-based warning aggregator, Cyprus included, actively maintained (its legacy RSS was sunset January 2026, so build on the Atom format) — *recommended*; (2) the **Cyprus Department of Meteorology** (`moa.gov.cy`) — the official source that feeds MeteoAlarm, but with no confirmed public machine-readable feed of its own; (3) the **data.gov.cy** open-data portal's meteorology group, worth a look for structured endpoints. **The decision:** adopt MeteoAlarm Atom, or accept the current link-out behavior as final.

## D9 — Partner photos — *supply*

Real partner photography for listing pages (§5 ledger). Nothing to build until images arrive.

## The pull request

**PR #236 (batches 56–79) is merged to `main`** — three automated-review findings were fixed in flight, every thread resolved. Batch 80 (D6) lands as its own PR on the restarted branch. Reminder: none of the merges has had a server-side CI run — D0 above is still the standing gap.

## Closed by design (no decision needed)

For completeness, items sometimes mistaken for open: the ≤360px layout cap (AUD-104 residual — intentional), the 161–185-char meta descriptions (AUD-121 residual — accepted), the AI assistant's bespoke focus trap (intentional, pinned by test since batch 70), and booking pages keeping their focused trust strip instead of the advisory strip (batch 50 design decision).

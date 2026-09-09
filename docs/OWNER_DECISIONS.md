# Owner decisions — everything that still needs a signature, not a keyboard

*Companion to `docs/UX_UI_PERSONA_AUDIT_2026-08-31.md` (batch 75). As of batches 56–74, every code-shaped item in the audit register is shipped, reviewed (two adversarial code passes, a claims audit, three full e2e battery runs, a security sweep) and gated in CI. What remains is listed here as one answerable decision each — with a recommendation, and with what ships the moment it's decided. Ordered by how much each decision unblocks.*

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

## D5 — Settle the Wiz "50 Best" duplicate rank (EN base facts)

**Blocked today:** two restaurants' curated EN facts collide — `cor-gastronomy` and `seasons-oriental` both claim Wiz 50 Best **#2**, and `seasons-oriental` says #2 in one field and "top 3" in another (caught by the batch-65 review; recorded, not changed, because the EN base is owner-curated fact).

**The decision:** check the actual Wiz list and say which rank each holds (or drop the rank claim from one).

**Ships when decided (minutes):** a one-line fix in `src/data/restaurants.ts` flows through the overlay pipeline to all 7 locales, guard-enforced.

## D6 — Curate the family lane (AUD-58)

**Blocked today:** editorial — the family filter works, but the audit found its *curation* thin (which places genuinely serve the family persona, in what order).

**The decision:** the family-lane place list (or delegate: a proposed list can be drafted for your yes/no).

**Ships when decided:** curated lane ×7 via the existing data pipeline.

## D7 — Per-guide price quotes (AUD-23 residual) — *supply*

The honest association-range signal shipped (batch 47). Individual quotes need numbers from the guides themselves. Nothing to build until partners supply them.

## D8 — Advisory alert-time behavior (AUD-25 residual) — *needs a source*

The per-locale advisory link map shipped (batch 43); the `/book/*` strip question was closed by design (batch 50). What remains is what the strip should do **during** an active alert — which needs a machine-readable alert source. **The decision:** name one (or accept the current link-out behavior as final).

## D9 — Partner photos — *supply*

Real partner photography for listing pages (§5 ledger). Nothing to build until images arrive.

## The pull request

Batches 56–74 stand verified end-to-end on `claude/ux-ui-audit-personas-60kdnz`: catalog 7×3,947, strict i18n coverage 0/0 (blind spot measured each run), 992 unit tests, 117 e2e tests, security-swept. **The PR opens on your word — none of D1–D9 blocks it.**

## Closed by design (no decision needed)

For completeness, items sometimes mistaken for open: the ≤360px layout cap (AUD-104 residual — intentional), the 161–185-char meta descriptions (AUD-121 residual — accepted), the AI assistant's bespoke focus trap (intentional, pinned by test since batch 70), and booking pages keeping their focused trust strip instead of the advisory strip (batch 50 design decision).

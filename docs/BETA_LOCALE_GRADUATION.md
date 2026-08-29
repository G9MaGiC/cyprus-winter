# Beta locale graduation (fr / he / ro)

How to remove the **beta** label from French, Hebrew, and Romanian once product and legal sign off.

## Current status (post PR #183)

| Area | Status |
|------|--------|
| Chrome (nav/footer/funnel/hubs) | Done — PR #179 |
| Editorial quality | Done — PR #182 |
| Privacy + terms **draft** translations | Done — PR #183 (BUG-334) |
| Lawyer / translator **sign-off** on legal pages | **Pending** |
| Automated readiness (`npm run i18n:beta-readiness`) | Clean as of Aug 2026 — 0 keys need review in fr/he/ro; the 26 fr EN-identical strings are confirmed cognates (classified in the script) |
| Switcher `localeBeta` badge | **Still shown** |

Code: `BETA_LOCALES` + `isBetaLocale` in `src/i18n/routing.ts`; UI in `src/components/LocaleLinks.tsx`.

## Graduation checklist

Do **not** empty `BETA_LOCALES` until every box is checked.

### Product

- [ ] Spot-check `/fr`, `/he`, `/ro` home → Discover → Plan → Book on mobile
- [ ] Confirm intentional EN holdouts are acceptable (`docs/BETA_LOCALE_EN_HOLDOUTS.md`)
- [ ] Hebrew RTL: overlays, sticky bars, plan day selector
- [ ] Locale switcher: names correct; beta badge ready to drop

### Legal (required)

- [ ] Lawyer or qualified translator reviews `privacy.page` for **fr**, **he**, **ro**
- [ ] Same for `terms.page`
- [ ] Rich tags preserved (`<strong>`, `{email}`, privacy policy link)
- [ ] Material corrections applied to `messages/{fr,he,ro}.json` **and** `scripts/i18n/beta-locale-legal-overrides.json`
- [ ] Sign-off recorded (ticket / email date) in `docs/QA_BUGS.md`

### Engineering (after sign-off)

1. Set `BETA_LOCALES` to `[]` (or remove the constant and always treat as non-beta) in `src/i18n/routing.ts`.
2. Update comment above `BETA_LOCALES` — chrome/editorial/legal are no longer “English body”.
3. Adjust `src/lib/beta-locale-chrome.test.ts`:
   - Stop requiring `isBetaLocale(fr|he|ro) === true`
   - Keep chrome/editorial/legal “must differ from EN” assertions (or rename suite)
4. Optional: leave `common.localeBeta` keys in message files (unused) or delete in a cleanup PR.
5. Update docs: this file, `LAUNCH_CHECKLIST.md` i18n beta row, `SCORECARD.md`, grant PART_B WP3 if still open.
6. Run gates:

```bash
npm run i18n:validate
npm run i18n:editorial-drift
npm run test
npm run test:e2e:gate:ci
```

## Readiness report

```bash
npm run i18n:beta-readiness
```

Prints EN-identical counts (excl. holdout patterns) and whether `BETA_LOCALES` is still populated. Does **not** replace lawyer review.

## Why beta stays for now

Draft legal copy is live for beta users, but **without professional review** we keep the switcher badge so visitors know fr/he/ro are still in soft launch. Removing the badge implies full-locale parity with el/de/pl.

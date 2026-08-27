# Beta locale (fr / he / ro) — intentional English holdouts

After PR #179 chrome batches 2–17 (BUG-314–329), remaining keys that still match `messages/en.json` in beta locales fall into the categories below. **Do not machine-translate** legal/admin blocks or brand-attribution strings without product review.

## Summary (post batch 16)

| Locale | EN-identical (excl. legal/admin) | Union (all 3 beta locales) |
|--------|----------------------------------|----------------------------|
| fr     | ~68 (includes valid French cognates) | ~43 |
| he     | ~43 | ~43 |
| ro     | ~45 | ~43 |

Hebrew chrome is complete except for the shared union holdouts below. French and Romanian may still show **valid cognates** (e.g. `Villages`, `Culture`, `Ambulance`) — identical spelling to English but correct in those languages.

## Re-apply all chrome batches

```bash
node scripts/i18n/patch-all-chrome-batches.mjs
```

Or individually:

```bash
for n in 2 3 4 5 6 7 8 9 10 11 12 13 14; do
  node scripts/i18n/patch-locale-chrome-batch${n}.mjs
done
node scripts/i18n/patch-locale-chrome-batch15.mjs
node scripts/i18n/patch-locale-chrome-batch16.mjs
```

Patch scripts live in `scripts/i18n/beta-locale-chrome-batch*-overrides.json`.

Editorial re-apply maps (`scripts/i18n/editorial-{fr,he,ro}.json`) should match `messages/*` after chrome batches — run `node scripts/i18n/apply-editorial-map.mjs <locale> scripts/i18n/editorial-<locale>.json` only when intentionally refreshing editorial body copy.

---

## Union holdouts (~43 keys)

Present in **fr, he, and ro** by design.

### Brand & product name

| Key | EN value | Reason |
|-----|----------|--------|
| `home.title` | Cyprus Winter | Product brand |
| `onboarding.welcome` | Cyprus Winter | Product brand |
| `install.page.nav.backLabel` | Cyprus Winter | Product brand |
| `plan.share.ogNamedTitle` | `{places} — Cyprus Winter` | OG brand suffix |

### Proper nouns (places, wineries, routes)

| Key pattern | Examples |
|-------------|----------|
| `home.editorsPicks.items.*.title` | Omodos, Kourion |
| `home.featuredWineries.items.*.title` | Tsiakkas, Vouni Panayia, Dómes Sergiou |
| `planQuick.quickAddPlaces.*` | Kourion, Omodos, Dómes Sergiou (Artemis translated in batch 14) |
| `wineRoutes.routeNames.*` | Krasochoria, Laona, Akamas, Commandaria |
| `footer.troodos`, `footer.paphos` | Region names |
| `cycling.page.officialRoutes.regions.troodos` | Troodos |
| `nature.page.excursions.regions.troodos` | Troodos |
| `nature.page.crosslinks.birdLife` | BirdLife Cyprus (org name) |

### Third-party & attribution

| Key | EN value | Reason |
|-----|----------|--------|
| `common.map.openStreetMap` | OpenStreetMap | Map attribution |
| `discover.map.openStreetMap` | OpenStreetMap | Map attribution |
| `auth.social.providers.google` | Google | OAuth provider label |
| `auth.social.providers.apple` | Apple | OAuth provider label |
| `discover.detail.booking.instagramCta` | Instagram @{handle} | Handle template |

### Placeholders & config (not UI copy)

| Key | EN value | Reason |
|-----|----------|--------|
| `auth.forgot.emailPlaceholder` | you@example.com | Example email |
| `auth.reset.passwordPlaceholder` | •••••••• | Mask pattern |
| `bookings.emailLookup.placeholder` | your@email.com | Example email |
| `trails.report.placeholders.email` | your@email.com | Example email |
| `partner.portal.profile.imagePlaceholder` | /images/cyprus/winery-example.jpg | File path |
| `install.page.troubleshooting.items.images.config` | images.unoptimized: true | Config snippet |

### Templates & symbols

| Key | EN value | Reason |
|-----|----------|--------|
| `plan.daySelector.unknownPlace` | … | Ellipsis placeholder |
| `plan.daySelector.summarySeparator` | ` → ` | Arrow separator |
| `trails.card.temperature` | `{value}°C` | Unit template |
| `trails.detail.liveWeather.temperature` | `{min}–{max}°C` | Unit template |
| `trails.detail.meta.descriptionPrefix` | `{location}. {lengthKm} km, {difficulty}.` | SEO template |
| `trails.map.popupMeta` | `{region} · {km} km` | Map popup template |
| `account.settings.privacy.footer.suffix` | `.` | Punctuation |
| `book.guideForm.finePrint.bodySuffix` | `.` | Punctuation |
| `book.wineryForm.finePrint.bodySuffix` | `.` | Punctuation |
| `book.pages.wineryDetail.winterTip.icon` | 💡 | Emoji |
| `book.pages.wineryDetail.jsonLd.priceRange` | €€ | Schema literal |

---

## French cognates (intentional identical spelling)

These keys may still match English in `fr.json` but are **correct French** — do not force alternate wording for i18n coverage metrics alone.

Examples: `Villages`, `Culture`, `Nature`, `Village`, `Restaurant`, `Local`, `Ambulance`, `Notifications`, `Distance`, `Transport`, `Expert`, `Actions`, `Conditions`, `Type`, `Festival`, `Concert`, `Sport`, `District`, `Solo`, `Couple`, `{distance} km`, `< 1 km`, official district bilingual labels (`Lemesos (Limassol)`, etc.).

Batch 14 applied selective French alternatives where a distinct form reads better (e.g. `Alertes`, `Transports`, `État`, `Seul` / `En couple`).

---

## Legal & admin (never MT in chrome batches)

- `privacy.*` — full privacy policy copy; lawyer/translator review only
- `terms.*` — full terms copy; lawyer/translator review only
- `admin.stats.*` — internal admin UI; English acceptable for operators

---

## QA reference

Logged in `docs/QA_BUGS.md` as BUG-314 through BUG-326. SCORECARD row: PR #179.

## Next steps (optional)

1. Native copy review for `he` editorial/home body — **started** (BUG-333 quality pass); re-run after further soft-gaps.
2. Professional translation for `privacy.*` / `terms.*` per locale (**legal track**).
3. Replace beta `localeBeta` suffix when editorial catches up (`common.localeBeta`).
4. Re-apply editorial quality: `node scripts/i18n/patch-beta-locale-editorial-quality.mjs` then `npm run i18n:editorial-drift`.

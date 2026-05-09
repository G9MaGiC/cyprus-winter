**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Term Base — Cyprus Winter

**Version:** 1.0  
**Last updated:** March 2026  
**Use for:** Consistent terminology across locales; translator and reviewer reference

---

## Key terms

Use one canonical translation per term per locale. Avoid synonyms within the same context.

| English | German (de) | Greek (el) | Polish (pl) |
|---------|-------------|------------|-------------|
| Add to plan | Zum Plan hinzufügen | Προσθήκη στο πρόγραμμα | Dodaj do planu |
| Book a tasting | Verkostung buchen | Κράτηση γευσιγνωσίας | Zarezerwuj degustację |
| Clear filters | Filter zurücksetzen | Καθαρισμός φίλτρων | Wyczyść filtry |
| Submit report | Bericht absenden | Υποβολή αναφοράς | Wyślij raport |
| Go home | Zur Startseite | Αρχική σελίδα | Strona główna |
| Try again | Erneut versuchen | Δοκιμάστε ξανά | Spróbuj ponownie |
| Discover | Entdecken | Ανακαλύψτε | Odkrywaj |
| Plan | Planen | Σχεδιάστε | Planuj |
| Trails | Wanderwege | Μονοπάτια | Szlaki |
| Itinerary | Reiseplan | Δρομολόγιο | Plan podróży |
| Ask AI | Ask AI | Ρωτήστε το AI | Zapytaj AI |
| The island rewards the curious | Die Insel belohnt die Neugierigen | Το νησί επιβραβεύει τους περίεργους | Wyspa nagradza ciekawskich |
| Sixteen degrees when home is six | Sechzehn Grad, wenn daheim sechs sind | Δεκαέξι βαθμοί όταν στο σπίτι έχετε έξι | Szesnaście stopni, gdy w domu jest sześć |

---

## Place names (keep as-is)

- Troodos, Kourion, Lefkara, Omodos, Nissi, Paphos, Larnaca, Protaras, Ayia Napa, Cape Greco, Artemis, Caledonia

---

## Brand

- **Cyprus Winter** — Keep in English in all locales (brand name)
- **Ask AI** — Keep in English (product feature)

---

## Tone per locale

| Locale | Notes |
|--------|-------|
| **en** | Warm, understated. Avoid hype. "Pair with…" not "Buy now." |
| **de** | Formal "Sie". Precise, factual. Trail conditions and logistics emphasized. |
| **el** | Local authenticity. Use Greek place names where natural (`nameEl` in data). |
| **pl** | Aspirational, value-focused. Nomad angle for weekend escapes. |

---

## QA checklist

- [ ] No mixed scripts (e.g. Cyrillic in Greek)
- [ ] Placeholder `{query}` unchanged in interpolated strings
- [ ] German: 30% longer than English — test truncation
- [ ] Polish: ą, ę, ł, ó, ś, ź, ż render correctly
- [ ] Greek: no RTL; check polytonic if used

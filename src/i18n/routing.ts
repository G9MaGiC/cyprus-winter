/** Locale routing. URL/locale policy: docs/INTERNATIONAL_SEO.md */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el", "de", "pl"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

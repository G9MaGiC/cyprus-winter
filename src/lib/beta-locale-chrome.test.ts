import { describe, expect, it } from "vitest";
import { BETA_LOCALES, isBetaLocale, routing } from "@/i18n/routing";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import he from "../../messages/he.json";
import ro from "../../messages/ro.json";

const betaMessages = { fr, he, ro } as const;

function nestedString(root: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, root);
  if (typeof value !== "string") {
    throw new Error(`expected string at ${path}`);
  }
  return value;
}

describe("beta locale chrome", () => {
  it("marks only fr, he, and ro as beta", () => {
    expect([...BETA_LOCALES].sort()).toEqual(["fr", "he", "ro"]);
    expect(routing.locales.filter(isBetaLocale)).toEqual(["ro", "fr", "he"]);
  });

  it("translates critical chrome away from English (except shared cognates)", () => {
    const mustDiffer = [
      "footer.discover",
      "footer.tagline",
      "footer.planYourTrip",
      "nav.signIn",
      "nav.secrets",
      "nav.openMenu",
      "common.skipToContent",
      "common.cookies.essentialOnly",
      "common.cookies.body",
      "errors.page.title",
      "errors.page.body",
      "bookings.page.sync.submit",
      "auth.login.ctaSignIn",
      "book.wineryForm.validation.emailInvalid",
    ];
    const mayMatchEnglish = new Set(["footer.plan", "nav.plan", "home.title"]);

    for (const locale of BETA_LOCALES) {
      const messages = betaMessages[locale];
      for (const key of mustDiffer) {
        if (mayMatchEnglish.has(key)) continue;
        expect(nestedString(messages, key), `${locale} ${key}`).not.toBe(nestedString(en, key));
      }
      expect(nestedString(messages, "common.localeBeta").length).toBeGreaterThan(0);
    }
  });

  it("translates priority editorial (home, Discover, Plan, Book, privacy summary)", () => {
    const editorialMustDiffer = [
      "home.headline",
      "home.degreesLine",
      "home.cta.explore",
      "home.hero.familyPicksLink",
      "home.startHere.title",
      "discover.addToPlan",
      "discover.page.noResultsTitle",
      "plan.emptyDay",
      "plan.mapTitle",
      "book.form.trust.emailConfirm",
      "privacy.page.header.description",
    ];
    for (const locale of BETA_LOCALES) {
      const messages = betaMessages[locale];
      for (const key of editorialMustDiffer) {
        expect(nestedString(messages, key), `${locale} ${key}`).not.toBe(nestedString(en, key));
      }
    }
  });

  it("translates privacy and terms body for beta locales (pending lawyer review)", () => {
    const legalMustDiffer = [
      "privacy.page.sections.s1.body",
      "privacy.page.sections.s5.outro",
      "privacy.page.sections.s5.rights.access",
      "terms.page.header.title",
      "terms.page.sections.s1.body",
      "terms.page.footer.privacyCta",
    ];
    for (const locale of BETA_LOCALES) {
      const messages = betaMessages[locale];
      for (const key of legalMustDiffer) {
        expect(nestedString(messages, key), `${locale} ${key}`).not.toBe(nestedString(en, key));
      }
    }
  });

  it("keeps beta labels until remaining body copy is done", () => {
    expect([...BETA_LOCALES].sort()).toEqual(["fr", "he", "ro"]);
    for (const locale of BETA_LOCALES) {
      expect(isBetaLocale(locale)).toBe(true);
      expect(nestedString(betaMessages[locale], "common.localeBeta").length).toBeGreaterThan(0);
    }
  });
});

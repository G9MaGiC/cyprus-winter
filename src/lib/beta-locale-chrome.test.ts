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
    const mayMatchEnglish = new Set(["footer.plan", "nav.plan"]);

    for (const locale of BETA_LOCALES) {
      const messages = betaMessages[locale];
      for (const key of mustDiffer) {
        if (mayMatchEnglish.has(key)) continue;
        expect(nestedString(messages, key), `${locale} ${key}`).not.toBe(nestedString(en, key));
      }
      expect(nestedString(messages, "common.localeBeta").length).toBeGreaterThan(0);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  isScannedSourceFile,
  findDynamicKeyPrefixesInFile,
  findIndirectNamespacePrefixes,
  findNamespaceBindingsInFile,
  findRegistryNamespacePrefixes,
  findUsedKeysInFile,
  resolveNamespaceAt,
} from "./coverage";

/**
 * The coverage detector gates every PR (strict since batch 69), so its own
 * failure modes are pinned here (batch 72): position-aware binding
 * resolution, rich-accessor calls, and the arrow-parameter false trigger
 * that could silently exempt a whole namespace from the gate.
 */

describe("coverage detector", () => {
  it("resolves each use to the nearest preceding binding when a name is re-bound", () => {
    const content = `
      const t = await getTranslations("book.pages.wineryDetail");
      const title = t("meta.title");
      const t = await getTranslations("regions.page");
      const other = t("meta.description");
    `;
    const bindings = findNamespaceBindingsInFile(content);
    expect(bindings.get("t")?.map((b) => b.ns)).toEqual([
      "book.pages.wineryDetail",
      "regions.page",
    ]);
    const used = findUsedKeysInFile(content, bindings);
    expect(used).toContain("book.pages.wineryDetail.meta.title");
    expect(used).toContain("regions.page.meta.description");
    // The old last-binding-wins collapse credited BOTH uses to regions.page.
    expect(used).not.toContain("regions.page.meta.title");
  });

  it("resolves dynamic template prefixes positionally too", () => {
    const content = `
      const t = await getTranslations("regions.page");
      const label = t(\`regions.\${slug}.title\`);
      const t = await getTranslations("wineRoutes.page");
      const name = t(\`routes.\${id}.name\`);
    `;
    const bindings = findNamespaceBindingsInFile(content);
    const prefixes = findDynamicKeyPrefixesInFile(content, bindings);
    expect(prefixes).toContain("regions.page.regions.");
    expect(prefixes).toContain("wineRoutes.page.routes.");
    expect(prefixes).not.toContain("wineRoutes.page.regions.");
  });

  it("counts t.rich / t.raw / t.markup as literal key usage", () => {
    const content = `
      const tTerms = await getTranslations("terms.page");
      const body = tTerms.rich("sections.s1.body", { b: chunks });
      const raw = tTerms.raw("sections.s2.items");
      const markup = tTerms.markup("sections.s3.note", {});
    `;
    const used = findUsedKeysInFile(content, findNamespaceBindingsInFile(content));
    expect(used).toContain("terms.page.sections.s1.body");
    expect(used).toContain("terms.page.sections.s2.items");
    expect(used).toContain("terms.page.sections.s3.note");
  });

  it("does not treat an arrow-function parameter as indirect consumption", () => {
    // Renaming a bound variable to `t` in a file with `.find((t) => …)` must
    // NOT exempt the namespace from the strict gate.
    const content = `
      const t = useTranslations("plan");
      const template = ITINERARY_TEMPLATES.find((t) => t.key === templateKey);
      const label = t("browsePlaces");
    `;
    const prefixes = findIndirectNamespacePrefixes(
      content,
      findNamespaceBindingsInFile(content)
    );
    expect(prefixes.size).toBe(0);
  });

  it("still treats a genuine pass-as-argument as indirect consumption", () => {
    const content = `
      const tAi = useTranslations("common.ai");
      const suggestions = tList(tAi, "suggestions.home", 6);
    `;
    const prefixes = findIndirectNamespacePrefixes(
      content,
      findNamespaceBindingsInFile(content)
    );
    expect(prefixes).toContain("common.ai.");
  });

  it("still treats a variable-key call as indirect consumption", () => {
    const content = `
      const tRoutes = useTranslations("wineRoutes");
      const name = tRoutes(route.slug);
    `;
    const prefixes = findIndirectNamespacePrefixes(
      content,
      findNamespaceBindingsInFile(content)
    );
    expect(prefixes).toContain("wineRoutes.");
  });

  it("registers every alternative of a union-typed registry namespace (batch 68)", () => {
    const content = `
      type Props = { namespace: "book.wineryForm" | "book.guideForm" };
    `;
    const prefixes = findRegistryNamespacePrefixes(content);
    expect(prefixes).toContain("book.wineryForm.");
    expect(prefixes).toContain("book.guideForm.");
  });

  it("keeps Promise.all positional alignment with non-translation elements", () => {
    const content = `
      const [data, tHome, tCommon] = await Promise.all([
        getHomeEditorsPicks(),
        getTranslations("home"),
        getTranslations("common"),
      ]);
      const title = tHome("hero.title");
      const label = tCommon("addPlace");
    `;
    const used = findUsedKeysInFile(content, findNamespaceBindingsInFile(content));
    expect(used).toContain("home.hero.title");
    expect(used).toContain("common.addPlace");
  });

  it("scans application sources only — a test fixture cannot keep a dead key credited", () => {
    // PR #236 review finding: footer.planYourTrip stayed "used" through a
    // single full-key literal in a test fixture. Test files are data about
    // the app, not consumption by it.
    expect(isScannedSourceFile("SiteFooter.tsx")).toBe(true);
    expect(isScannedSourceFile("recently-viewed.ts")).toBe(true);
    expect(isScannedSourceFile("SiteFooter.test.tsx")).toBe(false);
    expect(isScannedSourceFile("beta-locale-chrome.test.ts")).toBe(false);
    expect(isScannedSourceFile("notes.md")).toBe(false);
  });

  it("resolveNamespaceAt falls back to the first binding for uses above it", () => {
    expect(
      resolveNamespaceAt(
        [
          { ns: "a", index: 100 },
          { ns: "b", index: 200 },
        ],
        50
      )
    ).toBe("a");
  });
});

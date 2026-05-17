import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SerwistProvider } from "./index";

describe("SerwistProvider", () => {
  it("renders children during server rendering", () => {
    const html = renderToString(
      <SerwistProvider swUrl="/serwist/sw.js">
        <main>Localized content</main>
      </SerwistProvider>
    );

    expect(html).toContain("Localized content");
  });
});

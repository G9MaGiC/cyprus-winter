import { describe, expect, it } from "vitest";
import {
  extractIndexTrailSlugs,
  extractSitemapTrailSlugs,
  mergeTrailSlugs,
} from "./fetch-vc-trail-index";

describe("fetch-vc-trail-index", () => {
  it("extracts trail slugs from index HTML", () => {
    const html = `
      <a href="https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail/">Artemis</a>
      <a href="https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/atalanti-circular-lemesos-limassol-lefkosia-nicosia-districts-troodos-forest-nature-trail/">Atalante</a>
      <a href="https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/island-hiking/">Hub</a>
    `;
    expect(extractIndexTrailSlugs(html)).toEqual([
      "artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail",
      "atalanti-circular-lemesos-limassol-lefkosia-nicosia-districts-troodos-forest-nature-trail",
    ]);
  });

  it("extracts trail slugs from sitemap XML", () => {
    const xml = `
      <loc>https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/kalidonia-linear-lemesos-limassol-district-troodos-forest-nature-trail/</loc>
      <loc>https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/smigies-circular-pafos-paphos-district-akamas-forest-nature-trail/</loc>
    `;
    expect(extractSitemapTrailSlugs(xml)).toEqual([
      "kalidonia-linear-lemesos-limassol-district-troodos-forest-nature-trail",
      "smigies-circular-pafos-paphos-district-akamas-forest-nature-trail",
    ]);
  });

  it("merges index and sitemap slug lists", () => {
    expect(
      mergeTrailSlugs(
        ["artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail"],
        [
          "artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail",
          "kalidonia-linear-lemesos-limassol-district-troodos-forest-nature-trail",
        ],
        ["smigies-circular-pafos-paphos-district-akamas-forest-nature-trail"],
      ),
    ).toEqual([
      "artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail",
      "kalidonia-linear-lemesos-limassol-district-troodos-forest-nature-trail",
      "smigies-circular-pafos-paphos-district-akamas-forest-nature-trail",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import {
  buildPlacesExport,
  readPlacesJson,
  serializePlacesExport,
} from "./export-places";

describe("enrich-places export", () => {
  it("places.json matches live src/data export (run npm run data:export after data edits)", () => {
    const expected = serializePlacesExport(buildPlacesExport());
    const onDisk = serializePlacesExport(readPlacesJson());
    expect(onDisk).toBe(expected);
  });
});

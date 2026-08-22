/**
 * Data validation CLI — combineWith, coords, activity catalog, template IDs.
 * Run: npm run data:validate
 */
import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(__dirname, "..");

console.log("Running discover data audit tests…");
try {
  execSync("npx vitest run src/lib/discover-data-audit.test.ts src/data/itinerary-templates.test.ts src/data/winter-hours-audit.test.ts src/lib/activity-catalog.test.ts src/lib/activity-places.test.ts src/lib/wine-route-stops.test.ts src/lib/cyprus-images.test.ts src/lib/winery-image-intake.test.ts src/lib/vc-trail-index-audit.test.ts scripts/enrich-places/places-export.test.ts scripts/trails/fetch-vc-trail-index.test.ts scripts/trails/vc-trail-gap.test.ts scripts/trails/vc-hiking-map-validate.test.ts", {
    cwd: root,
    stdio: "inherit",
  });
  console.log("data:validate OK");
  process.exit(0);
} catch {
  console.error("data:validate FAILED");
  process.exit(1);
}

/**
 * CI E2E runs execute a production build with no external services. This
 * double flag lets specific production fail-closed gates (distributed rate
 * limiting, booking storage) fall back to their in-memory implementations
 * for those runs only. Both variables are supplied solely by the E2E jobs;
 * real production deployments never set them, so the gates still fail
 * closed there.
 */
export function isCiE2eTestMode(): boolean {
  return process.env.CI === "true" && process.env.E2E_TEST_MODE === "true";
}

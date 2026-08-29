/**
 * Gate script for launch ops — exits 0 only when live productionReady is true.
 *
 *   npm run health:production
 *   HEALTH_URL=https://cypruswinter.com/api/health npm run health:production
 */
const defaultUrl = "https://cyprus-winter-three.vercel.app/api/health";
const url = (process.env.HEALTH_URL || defaultUrl).replace(/\/$/, "");

type PublicHealth = {
  ok?: boolean;
  productionReady?: boolean;
  message?: string;
};

async function main(): Promise<void> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    process.exit(1);
  }

  const json = (await res.json()) as PublicHealth;
  const ready = json.productionReady === true;

  console.log(JSON.stringify({ url, httpStatus: res.status, ...json }, null, 2));

  if (ready) {
    console.log("PASS: productionReady is true.");
    process.exit(0);
  }

  console.error(
    "FAIL: productionReady is not true. Set UPSTASH_REDIS_* and Supabase env on Vercel Production — see docs/LAUNCH_CHECKLIST.md §1."
  );
  process.exit(1);
}

void main();

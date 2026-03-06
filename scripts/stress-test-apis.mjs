#!/usr/bin/env node
/**
 * Stress test for Cyprus Winter APIs
 * Usage: node scripts/stress-test-apis.mjs [baseUrl] [concurrency] [durationSec]
 * Example: node scripts/stress-test-apis.mjs http://localhost:3000 10 30
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";
const CONCURRENCY = parseInt(process.argv[3] || "10", 10);
const DURATION_SEC = parseInt(process.argv[4] || "30", 10);

const ENDPOINTS = [
  { path: "/api/health", method: "GET", body: null, name: "Health" },
  { path: "/api/stats", method: "GET", body: null, name: "Stats" },
  {
    path: "/api/bookings",
    method: "GET",
    body: null,
    name: "Get Bookings",
    searchParams: "?email=stress@test.local",
  },
  {
    path: "/api/bookings",
    method: "POST",
    body: {
      type: "winery_tasting",
      providerId: "tsiakkas",
      date: "2026-04-15",
      partySize: 2,
      guestName: "Stress Test",
      guestEmail: "stress@test.local",
    },
    name: "Create Booking",
  },
];

// Chat excluded by default (rate limits, cost) - use STRESS_INCLUDE_CHAT=1 to add
if (process.env.STRESS_INCLUDE_CHAT === "1") {
  ENDPOINTS.push({
    path: "/api/chat",
    method: "POST",
    body: { messages: [{ role: "user", content: "Hi" }] },
    name: "Chat",
  });
}

async function runOne(endpoint) {
  const url = endpoint.searchParams
    ? `${BASE_URL}${endpoint.path}${endpoint.searchParams}`
    : `${BASE_URL}${endpoint.path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: endpoint.method,
      headers: endpoint.body ? { "Content-Type": "application/json" } : undefined,
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
    });
    const elapsed = performance.now() - start;
    const ok = res.ok;
    return { ok, status: res.status, elapsed, name: endpoint.name };
  } catch (err) {
    const elapsed = performance.now() - start;
    return { ok: false, status: 0, elapsed, name: endpoint.name, error: err.message };
  }
}

async function runEndpoint(endpoint, results) {
  while (!results.stop) {
    const r = await runOne(endpoint);
    results.requests++;
    if (r.ok) results.ok++; else results.fail++;
    results.latencies.push(r.elapsed);
    if (r.elapsed > results.maxLatency) results.maxLatency = r.elapsed;
  }
}

async function main() {
  console.log(`\nCyprus Winter API Stress Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Concurrency: ${CONCURRENCY} per endpoint`);
  console.log(`Duration: ${DURATION_SEC}s`);
  console.log(`Endpoints: ${ENDPOINTS.map((e) => e.name).join(", ")}`);
  if (process.env.STRESS_INCLUDE_CHAT !== "1") {
    console.log(`(Chat excluded - set STRESS_INCLUDE_CHAT=1 to include)\n`);
  }

  const allResults = ENDPOINTS.map((e) => ({
    name: e.name,
    stop: false,
    requests: 0,
    ok: 0,
    fail: 0,
    latencies: [],
    maxLatency: 0,
  }));

  const workers = [];
  for (let i = 0; i < ENDPOINTS.length; i++) {
    for (let c = 0; c < CONCURRENCY; c++) {
      workers.push(runEndpoint(ENDPOINTS[i], allResults[i]));
    }
  }

  const timeout = new Promise((resolve) =>
    setTimeout(() => {
      allResults.forEach((r) => (r.stop = true));
      resolve();
    }, DURATION_SEC * 1000)
  );

  await Promise.race([Promise.all(workers), timeout]);

  // Report
  console.log("\n--- Results ---\n");
  for (const r of allResults) {
    const total = r.requests;
    const okPct = total ? ((r.ok / total) * 100).toFixed(1) : 0;
    const sorted = r.latencies.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;
    const avg = total ? r.latencies.reduce((a, b) => a + b, 0) / total : 0;

    console.log(`${r.name}:`);
    console.log(`  Requests: ${total} (${r.ok} ok, ${r.fail} fail) - ${okPct}% success`);
    console.log(`  Latency ms - avg: ${avg.toFixed(0)} p50: ${p50.toFixed(0)} p95: ${p95.toFixed(0)} p99: ${p99.toFixed(0)} max: ${r.maxLatency.toFixed(0)}`);
    console.log();
  }
}

main().catch(console.error);

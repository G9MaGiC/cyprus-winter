#!/usr/bin/env node
/**
 * Stress test for Cyprus Winter APIs
 * Usage: node scripts/stress-test-apis.mjs [baseUrl] [concurrency] [durationSec]
 * Example: node scripts/stress-test-apis.mjs http://localhost:3000 30 60
 * 
 * To bypass rate limits (dev mode): STRESS_BYPASS=1 node scripts/stress-test-apis.mjs
 * To test with AI chat: STRESS_INCLUDE_CHAT=1 node scripts/stress-test-apis.mjs
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";
const CONCURRENCY = parseInt(process.argv[3] || "10", 10);
const DURATION_SEC = parseInt(process.argv[4] || "30", 10);
const BYPASS_RATE_LIMIT = process.env.STRESS_BYPASS === "1";

const ENDPOINTS = [
  { path: "/api/health", method: "GET", body: null, name: "Health", weight: 10 },
  { path: "/api/stats", method: "GET", body: null, name: "Stats", weight: 2 },
  {
    path: "/api/bookings",
    method: "GET",
    body: null,
    name: "Get Bookings",
    searchParams: "?email=stress@test.local",
    weight: 5,
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
    weight: 3,
  },
  {
    path: "/api/trail-reports",
    method: "POST",
    body: {
      trailId: "artemis",
      status: "open",
      surface: "dry",
      note: "Stress test",
    },
    name: "Trail Report",
    weight: 2,
  },
];

// Chat excluded by default (rate limits, cost) - use STRESS_INCLUDE_CHAT=1 to add
if (process.env.STRESS_INCLUDE_CHAT === "1") {
  ENDPOINTS.push({
    path: "/api/chat",
    method: "POST",
    body: { messages: [{ role: "user", content: "Hi" }] },
    name: "Chat",
    weight: 1,
  });
}

function getHeaders(endpoint) {
  const headers = {};
  if (endpoint.body) {
    headers["Content-Type"] = "application/json";
  }
  if (BYPASS_RATE_LIMIT) {
    headers["x-stress-test"] = "bypass";
  }
  return Object.keys(headers).length > 0 ? headers : undefined;
}

async function runOne(endpoint) {
  const url = endpoint.searchParams
    ? `${BASE_URL}${endpoint.path}${endpoint.searchParams}`
    : `${BASE_URL}${endpoint.path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: endpoint.method,
      headers: getHeaders(endpoint),
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
    });
    const elapsed = performance.now() - start;
    const ok = res.ok;
    const rateLimitRemaining = res.headers.get("x-ratelimit-remaining");
    const rateLimitBypassed = res.headers.get("x-ratelimit-bypassed");
    return { 
      ok, 
      status: res.status, 
      elapsed, 
      name: endpoint.name,
      rateLimitRemaining,
      rateLimitBypassed: !!rateLimitBypassed,
    };
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
    if (r.rateLimitBypassed) results.bypassed++;
    if (r.rateLimitRemaining !== null) {
      results.rateLimitRemaining.push(parseInt(r.rateLimitRemaining, 10));
    }
  }
}

function createResults(name) {
  return {
    name,
    stop: false,
    requests: 0,
    ok: 0,
    fail: 0,
    latencies: [],
    maxLatency: 0,
    bypassed: 0,
    rateLimitRemaining: [],
  };
}

async function main() {
  console.log(`\nCyprus Winter API Stress Test`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Concurrency: ${CONCURRENCY} per endpoint`);
  console.log(`Duration: ${DURATION_SEC}s`);
  console.log(`Rate Limit Bypass: ${BYPASS_RATE_LIMIT ? "ENABLED" : "disabled"}`);
  console.log(`Endpoints: ${ENDPOINTS.map((e) => e.name).join(", ")}`);
  if (process.env.STRESS_INCLUDE_CHAT !== "1") {
    console.log(`(Chat excluded - set STRESS_INCLUDE_CHAT=1 to include)`);
  }
  console.log();

  const allResults = ENDPOINTS.map((e) => createResults(e.name));

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
  console.log("\n" + "=".repeat(70));
  console.log("STRESS TEST RESULTS");
  console.log("=".repeat(70));
  
  let totalRequests = 0;
  let totalOk = 0;

  for (const r of allResults) {
    const total = r.requests;
    const okPct = total ? ((r.ok / total) * 100).toFixed(1) : 0;
    const failPct = total ? ((r.fail / total) * 100).toFixed(1) : 0;
    const sorted = r.latencies.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;
    const avg = total ? r.latencies.reduce((a, b) => a + b, 0) / total : 0;
    const rps = (total / DURATION_SEC).toFixed(1);

    totalRequests += total;
    totalOk += r.ok;

    console.log(`\n📊 ${r.name}:`);
    console.log(`   Requests: ${total} total (${rps} req/s)`);
    console.log(`   Success:  ${r.ok} (${okPct}%) | Failed: ${r.fail} (${failPct}%)`);
    console.log(`   Latency:  avg=${avg.toFixed(1)}ms p50=${p50.toFixed(0)}ms p95=${p95.toFixed(0)}ms p99=${p99.toFixed(0)}ms max=${r.maxLatency.toFixed(0)}ms`);
    if (r.bypassed > 0) {
      console.log(`   ⚠️  Rate limit bypassed: ${r.bypassed} requests`);
    }
    
    // Performance rating
    if (avg < 50 && okPct > 99) {
      console.log(`   ✅ Excellent performance`);
    } else if (avg < 100 && okPct > 95) {
      console.log(`   ✅ Good performance`);
    } else if (avg < 200 && okPct > 90) {
      console.log(`   ⚠️  Acceptable performance`);
    } else {
      console.log(`   ❌ Poor performance - needs optimization`);
    }
  }

  // Summary
  const totalOkPct = totalRequests ? ((totalOk / totalRequests) * 100).toFixed(1) : 0;
  const totalRps = (totalRequests / DURATION_SEC).toFixed(0);
  
  console.log("\n" + "=".repeat(70));
  console.log(`TOTAL: ${totalRequests} requests | ${totalOk} ok (${totalOkPct}%) | ${totalRps} req/s`);
  console.log("=".repeat(70));

  // Recommendations
  console.log("\n📋 Recommendations:");
  const failedEndpoints = allResults.filter(r => r.fail > 0);
  if (failedEndpoints.length > 0) {
    console.log(`   - ${failedEndpoints.length} endpoint(s) had failures`);
    if (!BYPASS_RATE_LIMIT) {
      console.log(`   - Run with STRESS_BYPASS=1 to test without rate limiting`);
    }
  }
  
  const slowEndpoints = allResults.filter(r => {
    const avg = r.requests ? r.latencies.reduce((a, b) => a + b, 0) / r.requests : 0;
    return avg > 100;
  });
  if (slowEndpoints.length > 0) {
    console.log(`   - ${slowEndpoints.length} endpoint(s) have high latency (>100ms avg)`);
  }
  
  if (failedEndpoints.length === 0 && slowEndpoints.length === 0) {
    console.log(`   ✅ All endpoints performing well under ${CONCURRENCY} concurrent users`);
  }
  console.log();
}

main().catch(console.error);

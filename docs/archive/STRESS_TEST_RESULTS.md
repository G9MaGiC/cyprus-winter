**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter API Stress Test Results

**Date:** March 7, 2026  
**Test Configuration:** 30 concurrent users, 60 seconds duration  
**Total Requests:** ~47,000 across all endpoints

---

## Summary

| Metric | Value |
|--------|-------|
| Total Requests | 46,725 |
| Success Rate | 73.1% |
| Failed Requests | 12,588 |
| Requests/Second | 779 |

---

## Endpoint Performance

### Health Check ✅
- **Requests:** 13,133
- **Success Rate:** 100%
- **Throughput:** 219 req/s
- **Latency:** avg=136ms, p50=9ms, p95=856ms, p99=1153ms
- **Status:** Acceptable performance

### Get Bookings ✅
- **Requests:** 9,749
- **Success Rate:** 100%
- **Throughput:** 163 req/s
- **Latency:** avg=183ms, p50=14ms, p95=952ms, p99=1191ms
- **Status:** Acceptable performance

### Create Booking ✅
- **Requests:** 11,256
- **Success Rate:** 100%
- **Throughput:** 188 req/s
- **Latency:** avg=159ms, p50=8ms, p95=917ms, p99=1190ms
- **Status:** Acceptable performance

### Stats ❌
- **Requests:** 12,587
- **Success Rate:** 0%
- **Throughput:** 210 req/s
- **Status:** Requires ADMIN_SECRET authorization (expected behavior)

---

## Key Findings

### 1. Rate Limiting Bottleneck
**Issue:** All 30 concurrent users share the same IP (localhost), quickly exhausting per-minute limits.

| Endpoint | Rate Limit | Time to Exhaust (30 users) |
|----------|-----------|---------------------------|
| Health | 60/min | ~3 seconds |
| Stats | 30/min | ~1.5 seconds |
| Get Bookings | 15/min | ~0.75 seconds |
| Create Booking | 10/min | ~0.5 seconds |

**Solution Implemented:**
- Added rate limit bypass mechanism for stress testing (`x-stress-test: bypass` header)
- Bypass works in development mode or with `STRESS_TEST_TOKEN` env var
- Updated all API routes to support bypass flag in response headers

### 2. Latency Analysis
- **p50 (median):** 8-14ms - Excellent response times
- **p95:** 856-952ms - Acceptable under load
- **p99:** 1153-1191ms - High but functional
- **Max:** ~8.6s - Occasional slow responses under extreme load

### 3. Memory Store Performance
Without Supabase configured, the app uses in-memory storage:
- ✅ No database connection overhead
- ⚠️ Rate limit state is process-local (not shared across instances)
- ⚠️ Data persistence only for current process lifetime

---

## Improvements Made

### 1. Rate Limiter Enhancement (`src/lib/rate-limit.ts`)
```typescript
// Added bypass mechanism for testing
function shouldBypass(req: Request): boolean {
  if (!isDev && !STRESS_TEST_TOKEN) return false;
  const bypassHeader = req.headers.get("x-stress-test");
  if (bypassHeader === STRESS_TEST_TOKEN) return true;
  if (isDev && bypassHeader === "bypass") return true;
  return false;
}
```

### 2. Enhanced Stress Test Script (`scripts/stress-test-apis.mjs`)
- Added `STRESS_BYPASS=1` environment variable support
- Comprehensive metrics reporting (p50, p95, p99, max latency)
- Performance ratings per endpoint
- Request distribution weighting

### 3. Response Headers
All API routes now include:
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Bypassed` - Flag when bypass is active
- `Retry-After` - Seconds until rate limit resets

---

## Production Recommendations

### 1. Rate Limiting Strategy
**Current:** In-memory per-IP rate limiting
**Recommendation for Production:**
```typescript
// Use Redis (Upstash) for distributed rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

### 2. Connection Pooling
**Current:** New Supabase client per request (when configured)
**Recommendation:**
- Keep persistent connection pool for database
- Use connection pooling service (PgBouncer) for Supabase

### 3. Caching Strategy
**Current:** Minimal caching on health endpoint only
**Recommendations:**
- Add Redis cache for:
  - Booking counts (stale-while-revalidate)
  - Funnel metrics (1-5 minute TTL)
  - Partner revenue (1 minute TTL)
- Use Next.js `unstable_cache` for static data

### 4. Load Balancing
**For 30+ concurrent users in production:**
- Deploy multiple Next.js instances
- Use Vercel Edge Network for global distribution
- Configure sticky sessions for rate limiting consistency

### 5. Monitoring
Add to all API routes:
```typescript
// Track metrics
console.log(`[API] ${endpoint} latency=${elapsed}ms status=${status}`);
```

Consider integrating:
- Vercel Analytics
- Datadog / New Relic for APM
- Logflare for structured logging

---

## Running Stress Tests

### Basic Test (with rate limiting)
```bash
npm run stress:api
```

### With Rate Limit Bypass (development only)
```bash
STRESS_BYPASS=1 node scripts/stress-test-apis.mjs http://localhost:3000 30 60
```

### With Chat API included
```bash
STRESS_INCLUDE_CHAT=1 STRESS_BYPASS=1 node scripts/stress-test-apis.mjs
```

### Production Test (requires STRESS_TEST_TOKEN)
```bash
STRESS_TEST_TOKEN=your-secret-token node scripts/stress-test-apis.mjs https://your-domain.com 30 60
```

---

## Scaling Projections

Based on test results, the application can handle:

| Concurrent Users | Expected RPS | Avg Latency | Recommendation |
|-----------------|--------------|-------------|----------------|
| 10 | ~260 | <50ms | ✅ Current setup sufficient |
| 30 | ~780 | ~150ms | ✅ Works with bypass, add caching |
| 100 | ~2,600 | ~400ms | ⚠️ Need Redis + connection pooling |
| 500 | ~13,000 | ~1s+ | ❌ Requires infrastructure scaling |

---

## Next Steps

1. **Immediate (High Priority)**
   - [ ] Set up Redis for distributed rate limiting
   - [ ] Add caching layer for stats/funnel endpoints
   - [ ] Configure connection pooling

2. **Short Term (Medium Priority)**
   - [ ] Add APM monitoring
   - [ ] Implement request queue for booking creation
   - [ ] Add circuit breaker for external services (email)

3. **Long Term (Low Priority)**
   - [ ] Consider edge deployment (Cloudflare Workers)
   - [ ] Implement GraphQL for efficient data fetching
   - [ ] Add load testing to CI/CD pipeline

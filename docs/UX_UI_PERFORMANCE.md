# UX/UI Performance Guide

## Overview

This document outlines UX/UI improvements for high-traffic scenarios and performance optimization from a user experience perspective.

---

## Current State Analysis

### Loading States

| Component | Current | Issue | Priority |
|-----------|---------|-------|----------|
| AI Assistant | Typing dots | Good | ✅ |
| Bookings List | Simple pulse | Needs skeleton | Medium |
| Winery Booking | Spinner in button | Good | ✅ |
| Search Results | None (instant) | Good | ✅ |
| Map Loading | Text + pulse | Acceptable | Low |

### Error Handling

| Scenario | Current UX | Issue | Priority |
|----------|-----------|-------|----------|
| Rate Limit (429) | Text message | No countdown | High |
| Network Error | Generic message | No retry guidance | High |
| API Failure | Simple error | No fallback | Medium |
| 404 | Not found page | Good | ✅ |

---

## New Components

### 1. Skeleton Loaders (`src/components/ui/Skeleton.tsx`)

**Purpose:** Improve perceived performance during content loading

**Usage:**
```tsx
import { ListSkeleton, BookingCardSkeleton } from "@/components/ui/Skeleton";

// In your component
{loading ? (
  <ListSkeleton count={3} />
) : (
  <BookingList bookings={bookings} />
)}
```

**Available Skeletons:**
- `Skeleton` - Base animated block
- `CardSkeleton` - Full card with image, title, subtitle
- `TextSkeleton` - Multi-line text placeholder
- `BookingCardSkeleton` - Booking-specific card
- `ListSkeleton` - Multiple row items
- `HeroSkeleton` - Hero section placeholder
- `SearchResultSkeleton` - Search dropdown items

### 2. Error States (`src/components/ui/ErrorState.tsx`)

**Purpose:** Consistent, actionable error messaging

**Usage:**
```tsx
import { ErrorState, RateLimitError, NetworkError } from "@/components/ui/ErrorState";

// Generic error
<ErrorState
  title="Booking failed"
  message="We couldn't send your request. Please try again."
  retry={handleRetry}
/>

// Rate limit with countdown
<RateLimitError
  retryAfter={60}
  onRetry={fetchBookings}
/>

// Network status aware
<NetworkError onRetry={fetchBookings} />
```

### 3. Toast Notifications (`src/components/ui/Toast.tsx`)

**Purpose:** Non-blocking user feedback for async operations

**Usage:**
```tsx
import { useToast, ToastContainer } from "@/components/ui/Toast";

function MyComponent() {
  const { toasts, removeToast, success, error } = useToast();

  const handleBooking = async () => {
    try {
      await createBooking(data);
      success("Booking confirmed! Check your email.");
    } catch (e) {
      error("Couldn't complete booking. Try again.");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* rest of component */}
    </>
  );
}
```

**Toast Types:**
- `success` - Green (aegean), confirmations
- `error` - Terracotta, failures
- `warning` - Golden, cautions
- `info` - Olive, general info

### 4. Loading Overlay (`src/components/ui/LoadingOverlay.tsx`)

**Purpose:** Block interaction during critical operations

**Usage:**
```tsx
import { LoadingOverlay, ButtonLoading, ProgressBar } from "@/components/ui/LoadingOverlay";

// Section overlay
<LoadingOverlay isLoading={saving} message="Saving your trip…">
  <ItineraryContent />
</LoadingOverlay>

// Button loading state
<button disabled={loading}>
  <ButtonLoading isLoading={loading} loadingText="Sending…">
    Send Request
  </ButtonLoading>
</button>

// Progress indicator
<ProgressBar progress={uploadProgress} />
```

---

## UX Improvements Implemented

### 1. Rate Limit Feedback

**Before:**
- Simple text: "Too many requests. Wait a moment and try again."

**After:**
- Visual countdown timer
- Disabled retry button with remaining time
- Clear explanation of why waiting is needed
- Auto-enable when limit resets

### 2. Network Error Handling

**Before:**
- Generic error message
- No indication of online/offline status

**After:**
- Real-time online/offline detection
- Contextual messaging based on connection state
- Clear retry action

### 3. Loading Perception

**Before:**
- Blank states while loading
- Sudden content appearance

**After:**
- Skeleton placeholders matching content structure
- Smooth transitions
- Reduced layout shift

---

## Stress Test UX Scenarios

### Scenario 1: 30 Concurrent Users Booking

**Problem:** Users may see rate limit errors during peak booking times.

**Solution:**
- `RateLimitError` component shows countdown
- Queue bookings client-side during 429 responses
- Toast notification when booking eventually succeeds

```tsx
const handleBooking = async () => {
  setIsLoading(true);
  try {
    await createBooking(data);
    success("Booking confirmed!");
  } catch (err) {
    if (err.status === 429) {
      error("High demand right now. Your booking is queued—we'll retry automatically.");
      queueForRetry(data);
    }
  } finally {
    setIsLoading(false);
  }
};
```

### Scenario 2: Slow Network Conditions

**Problem:** Users on slow connections see long loading times.

**Solution:**
- Progressive loading with skeletons
- Optimistic UI updates
- Offline indicator

```tsx
// Optimistic update
const addToItinerary = (place) => {
  // Update UI immediately
  setItinerary([...itinerary, place]);
  success("Added to your trip");
  
  // Sync in background
  syncToServer(place).catch(() => {
    warning("Saved locally. Will sync when online.");
  });
};
```

### Scenario 3: API Failures During Search

**Problem:** Search stops working during API outages.

**Solution:**
- Client-side search as fallback
- Error boundary with retry
- Cached results display

---

## Mobile Performance Considerations

### Touch Targets

All interactive elements must be minimum 44px:
```css
min-h-[44px]
min-w-[44px]
```

### Reduced Motion

Respect `prefers-reduced-motion`:
```tsx
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// In JSX
className={reduceMotion ? "" : "animate-pulse"}
```

### Network Awareness

```tsx
const connection = navigator.connection;
if (connection?.effectiveType === "2g") {
  // Load low-res images
  // Disable auto-play
  // Simplify animations
}
```

---

## Accessibility During Loading

### Screen Reader Support

```tsx
// Always announce loading states
<div 
  role="status" 
  aria-live="polite" 
  aria-busy="true"
  aria-label="Loading your bookings"
>
  <span className="sr-only">Loading…</span>
  <Skeleton />
</div>

// Announce completions
useEffect(() => {
  if (!loading && wasLoading) {
    announce("Bookings loaded");
  }
}, [loading]);
```

### Focus Management

```tsx
// Return focus after error
const errorRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (error) {
    errorRef.current?.focus();
  }
}, [error]);

// In JSX
<div ref={errorRef} tabIndex={-1} role="alert">
  {error}
</div>
```

---

## Performance Budgets (UX Targets)

| Metric | Target | Maximum | Notes |
|--------|--------|---------|-------|
| First Contentful Paint | < 1s | 1.5s | Show skeleton immediately |
| Time to Interactive | < 2s | 3s | Enable booking button |
| Loading Skeleton | < 100ms | 200ms | Prevent layout shift |
| Error Feedback | < 50ms | 100ms | Immediate user acknowledgment |
| Toast Display | < 100ms | 200ms | Non-blocking notification |
| Retry Action | < 1s | 2s | After rate limit expires |

---

## Implementation Checklist

### For API Routes
- [ ] Return appropriate status codes (429, 503, etc.)
- [ ] Include `Retry-After` header for 429s
- [ ] Provide human-readable error messages

### For Components
- [ ] Use skeleton loaders for async data
- [ ] Implement error boundaries
- [ ] Add retry functionality
- [ ] Show toast confirmations

### For Forms
- [ ] Disable submit during loading
- [ ] Show inline validation errors
- [ ] Display success toast on completion
- [ ] Handle 429 with countdown

### For Lists
- [ ] Virtualize long lists (>50 items)
- [ ] Use skeleton placeholders
- [ ] Implement infinite scroll with loading indicator
- [ ] Cache previous results

---

## Testing UX Under Load

```bash
# Run stress test
STRESS_BYPASS=1 node scripts/stress-test-apis.mjs http://localhost:3000 30 60

# Monitor UX metrics
# - Time to first skeleton
# - Error message clarity
# - Retry button functionality
# - Toast display timing
```

---

## Future Enhancements

1. **Service Worker** - Cache API responses for offline access
2. **Background Sync** - Queue mutations during offline periods
3. **Predictive Prefetching** - Load likely next pages
4. **Image Optimization** - Responsive images with blur placeholders
5. **Virtual Scrolling** - For long lists (bookings, trails)

---

## Related Documentation

- [STRESS_TEST_RESULTS.md](./STRESS_TEST_RESULTS.md) - API performance data
- [TECHNICAL.md](../TECHNICAL.md) - Architecture overview
- Design tokens in `src/lib/design-tokens.ts`

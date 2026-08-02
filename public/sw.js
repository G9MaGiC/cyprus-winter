const CACHE_NAME = "cyprus-winter-shell-v1";
const PRECACHE_URLS = ["/", "/plan", "/discover", "/trails", "/manifest.json"];

function safeNotificationUrl(value) {
  if (typeof value !== "string") return "/";
  try {
    const parsed = new URL(value, self.location.origin);
    if (parsed.origin !== self.location.origin) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const isPrivatePath = ["/bookings", "/admin"].some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));\n  const hasCredentials = request.headers.has("authorization") || request.headers.has("cookie");\n  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || isPrivatePath || hasCredentials) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match("/"))
          .then((cached) => cached || Response.error())
      )
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  const title = typeof payload.title === "string" ? payload.title : "Cyprus Winter";
  const body = typeof payload.body === "string" ? payload.body : "";
  const url = safeNotificationUrl(payload.url);
  const options = {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeNotificationUrl(event.notification.data?.url);
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const c of clientList) {
        if (c.url.startsWith(self.location.origin) && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

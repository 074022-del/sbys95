/* SbyS PWA Service Worker (basic) */
const CACHE_NAME = "sbys-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/sw.js",
  "/icon-original-192.png",
  "/icon-original-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // НЕ перехватываем админку и API (иначе /admin будет показывать главный сайт)
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) {
    return;
  }
  // Только GET кэшируем
  if (req.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        // Кладём в кэш только успешные ответы
        if (res && res.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
        }
        return res;
      } catch (e) {
        // если офлайн и нет кэша — вернём главную
        const fallback = await caches.match("/index.html");
        return fallback || new Response("Offline", { status: 503 });
      }
    })()
  );
});

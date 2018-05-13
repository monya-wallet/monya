let ver= "<!--t:Timestamp-->"
let cacheData = "<!--t:Caches-->".split(",").map(d=>"/wallet/dist/assets/"+d+"?t="+ver)
let cacheName = "cache-"+ver

cacheData.push("/wallet/index.html")
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(cacheData)
          .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});

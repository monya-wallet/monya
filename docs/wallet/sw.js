let version = '1.0.0';
const files=[
  "./index.html",
  "./dist/dist.js"
]

self.addEventListener('install', e => {
  let timeStamp = Date.now();
  e.waitUntil(
    caches.open('monya').then(cache => {
      return cache.addAll(files)
      .then(() => self.skipWaiting());
    })
  )
});
 
self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});
 
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
  );
});

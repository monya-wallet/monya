let version = '1.0.4';
const files=[
  "./index.html"
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
  event.waitUntil(caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => {
          return !CACHE_KEYS.includes(key);
        }).map(key => {
          return caches.delete(key);
        })
      );
    }));
});
 
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
  );
});

let ver= "<!--t:Timestamp-->"
let cacheData = "<!--t:Caches-->".split(",").map(d=>"assets/"+d)
let cName = "cache-"+ver

cacheData.push("dist.js")

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cName)
      .then((cache) => {
        return cache.addAll(cacheData);
      })
  );
});
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cName];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        let fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 重要：レスポンスを clone する。レスポンスは Stream で
            // ブラウザ用とキャッシュ用の2回必要。なので clone して
            // 2つの Stream があるようにする
            let responseToCache = response.clone();

            caches.open(cName)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

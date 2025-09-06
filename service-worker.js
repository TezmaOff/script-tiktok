self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('pwa-cache').then(cache =>
      cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/main.js',
        '/ffmpeg-core.js',
        '/manifest.json'
      ])
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('install', e => {self.addEventListener('install', e =>});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
  self.skipWaiting();

// Mi Rutina - service worker: funciona sin internet y se actualiza cuando hay señal
const CACHE = 'mi-rutina-202611270008';
const BASE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './favicon.ico', './favicon-32.png', './apple-touch-icon.png', './icon-maskable-192.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero intenta internet (para tener la versión más nueva); si no hay señal, usa la copia guardada
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

/* Offline-Cache: alle App-Dateien werden beim ersten Besuch gespeichert. */
const VERSION = 'jp-app-v5';
const FILES = ['./', 'index.html', 'style.css', 'manifest.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/data-kana.js', 'js/data-kanji.js', 'js/data-lessons1.js', 'js/data-lessons2.js', 'js/data-lessons3.js', 'js/data-lessons4.js', 'js/core.js', 'js/ui-q.js', 'js/slots.js', 'js/app.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(ch => ch.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match('index.html'))));
});
